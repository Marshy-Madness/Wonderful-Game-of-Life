package com.wonderfulgame.shell

import android.content.Context

class ServerPrefs(context: Context) {

    private val prefs = context.applicationContext
        .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    fun hasServerUrl(): Boolean {
        val u = prefs.getString(KEY_BASE_URL, null)
        return !u.isNullOrBlank()
    }

    fun getServerUrl(): String? = prefs.getString(KEY_BASE_URL, null)?.takeIf { it.isNotBlank() }

    fun setServerUrl(url: String) {
        prefs.edit().putString(KEY_BASE_URL, url).apply()
    }

    companion object {
        private const val PREFS_NAME = "wonderful_shell"
        private const val KEY_BASE_URL = "base_url"
    }
}
