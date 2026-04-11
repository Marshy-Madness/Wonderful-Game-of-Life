package com.wonderfulgame.shell

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Bitmap
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import android.view.ViewGroup
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import androidx.activity.OnBackPressedCallback
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.updatePadding
import com.google.android.material.appbar.MaterialToolbar
import org.json.JSONObject

class MainActivity : AppCompatActivity() {

    private lateinit var toolbar: MaterialToolbar
    private lateinit var webViewContainer: FrameLayout
    private var webView: WebView? = null
    private var shellCssInjected = false

    private val prefs by lazy { ServerPrefs(this) }

    private val setupLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK) {
            val url = prefs.getServerUrl() ?: return@registerForActivityResult
            attachWebView(url)
        } else if (!prefs.hasServerUrl()) {
            finish()
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_main)

        toolbar = findViewById(R.id.toolbar)
        webViewContainer = findViewById(R.id.webview_container)

        val root = findViewById<android.view.View>(R.id.main_root)
        ViewCompat.setOnApplyWindowInsetsListener(root) { v, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.updatePadding(
                left = bars.left,
                right = bars.right,
                top = bars.top
            )
            insets
        }
        ViewCompat.setOnApplyWindowInsetsListener(webViewContainer) { v, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.updatePadding(
                left = bars.left,
                right = bars.right,
                bottom = bars.bottom
            )
            insets
        }

        setSupportActionBar(toolbar)

        onBackPressedDispatcher.addCallback(
            this,
            object : OnBackPressedCallback(false) {
                override fun handleOnBackPressed() {
                    val wv = webView
                    if (wv != null && wv.canGoBack()) wv.goBack()
                    else finish()
                }
            }.also { backCallback = it }
        )

        if (prefs.hasServerUrl()) {
            attachWebView(prefs.getServerUrl()!!)
        } else {
            openServerSetup(firstRun = true)
        }
    }

    private var backCallback: OnBackPressedCallback? = null

    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menuInflater.inflate(R.menu.main_menu, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        if (item.itemId == R.id.action_settings) {
            openServerSetup(firstRun = false)
            return true
        }
        return super.onOptionsItemSelected(item)
    }

    private fun openServerSetup(firstRun: Boolean) {
        val i = Intent(this, ServerSetupActivity::class.java).apply {
            putExtra(ServerSetupActivity.EXTRA_FIRST_RUN, firstRun)
            if (!firstRun) {
                putExtra(ServerSetupActivity.EXTRA_CURRENT_URL, prefs.getServerUrl())
            }
        }
        setupLauncher.launch(i)
    }

    private fun attachWebView(baseUrl: String) {
        val existing = webView
        if (existing != null) {
            existing.stopLoading()
            webViewContainer.removeView(existing)
            existing.destroy()
            webView = null
        }

        shellCssInjected = false

        val wv = WebView(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
        }
        webView = wv
        webViewContainer.addView(wv)

        backCallback?.isEnabled = true

        wv.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            cacheMode = WebSettings.LOAD_DEFAULT
            mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
            // SPA uses width=device-width; overview mode zooms the whole page out (tiny UI in a corner).
            useWideViewPort = true
            loadWithOverviewMode = false
            builtInZoomControls = true
            displayZoomControls = false
            textZoom = 100
        }

        wv.webChromeClient = WebChromeClient()
        wv.webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                shellCssInjected = false
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                injectShellCss(wv)
            }

            override fun shouldOverrideUrlLoading(
                view: WebView?,
                request: WebResourceRequest?
            ): Boolean = false
        }

        wv.loadUrl(baseUrl)
    }

    private fun injectShellCss(wv: WebView) {
        if (shellCssInjected) return
        val css = try {
            assets.open("mobile_shell.css").bufferedReader(Charsets.UTF_8).use { it.readText() }
        } catch (_: Exception) {
            return
        }
        val quoted = JSONObject.quote(css)
        val script =
            "(function(){var s=document.createElement('style');s.setAttribute('data-wonderful-shell','1');" +
                "s.appendChild(document.createTextNode($quoted));" +
                "(document.head||document.documentElement).appendChild(s);})();"
        wv.evaluateJavascript(script) { shellCssInjected = true }
    }

    override fun onDestroy() {
        webView?.let { wv ->
            wv.stopLoading()
            (wv.parent as? ViewGroup)?.removeView(wv)
            wv.destroy()
        }
        webView = null
        super.onDestroy()
    }
}
