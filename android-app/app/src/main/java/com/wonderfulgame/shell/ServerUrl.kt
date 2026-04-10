package com.wonderfulgame.shell

import android.net.Uri

object ServerUrl {

    /**
     * Accepts host:port, ip:port, or full http(s) URL. Returns normalized base URL with trailing slash, or null if invalid.
     */
    fun normalize(input: String): String? {
        var s = input.trim()
        if (s.isEmpty()) return null

        if (!s.contains("://")) {
            s = "http://$s"
        }

        val uri = Uri.parse(s)
        val scheme = uri.scheme?.lowercase() ?: return null
        if (scheme != "http" && scheme != "https") return null
        if (uri.host.isNullOrBlank()) return null

        val clean = uri.buildUpon().clearQuery().fragment(null).build()
        return clean.toString().trimEnd('/') + "/"
    }
}
