package com.wonderfulgame.shell

import android.os.Bundle
import androidx.activity.OnBackPressedCallback
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.updatePadding
import com.google.android.material.appbar.MaterialToolbar
import com.google.android.material.button.MaterialButton
import com.google.android.material.textfield.TextInputEditText
import com.google.android.material.textfield.TextInputLayout

class ServerSetupActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_server_setup)

        val root = findViewById<android.view.View>(R.id.setup_root)
        val pad = (24 * resources.displayMetrics.density).toInt()
        ViewCompat.setOnApplyWindowInsetsListener(root) { v, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.updatePadding(
                left = pad + bars.left,
                right = pad + bars.right,
                top = pad + bars.top,
                bottom = pad + bars.bottom
            )
            insets
        }

        val firstRun = intent.getBooleanExtra(EXTRA_FIRST_RUN, false)
        val toolbar = findViewById<MaterialToolbar>(R.id.setup_toolbar)
        toolbar.title = if (firstRun) {
            getString(R.string.server_setup_title_first)
        } else {
            getString(R.string.server_setup_title_settings)
        }
        toolbar.setNavigationOnClickListener { leaveSetup() }

        val urlLayout = findViewById<TextInputLayout>(R.id.url_layout)
        val urlInput = findViewById<TextInputEditText>(R.id.url_input)
        val saveButton = findViewById<MaterialButton>(R.id.save_button)

        intent.getStringExtra(EXTRA_CURRENT_URL)?.let { urlInput.setText(it) }

        saveButton.setOnClickListener {
            val raw = urlInput.text?.toString().orEmpty()
            val normalized = ServerUrl.normalize(raw)
            if (normalized == null) {
                urlLayout.error = getString(R.string.server_error_invalid_url)
                return@setOnClickListener
            }
            urlLayout.error = null
            ServerPrefs(this).setServerUrl(normalized)
            setResult(RESULT_OK)
            finish()
        }

        onBackPressedDispatcher.addCallback(
            this,
            object : OnBackPressedCallback(true) {
                override fun handleOnBackPressed() {
                    leaveSetup()
                }
            }
        )
    }

    private fun leaveSetup() {
        if (intent.getBooleanExtra(EXTRA_FIRST_RUN, false)) {
            finishAffinity()
        } else {
            setResult(RESULT_CANCELED)
            finish()
        }
    }

    companion object {
        const val EXTRA_FIRST_RUN = "first_run"
        const val EXTRA_CURRENT_URL = "current_url"
    }
}
