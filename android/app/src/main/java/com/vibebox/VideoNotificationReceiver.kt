package com.vibebox

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class VideoNotificationReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        
        // Obtener instancia del módulo para enviar eventos
        val reactContext = (context.applicationContext as MainApplication)
            .reactNativeHost
            .reactInstanceManager
            .currentReactContext
        
        reactContext?.let {
            val module = it.getNativeModule(VideoNotificationModule::class.java)
            
            when (action) {
                "ACTION_PLAY" -> module?.sendEvent("onPlayPressed")
                "ACTION_PAUSE" -> module?.sendEvent("onPausePressed")
                "ACTION_STOP" -> module?.sendEvent("onStopPressed")
                else -> {
                    // Acción no reconocida, no hacer nada
                }
            }
        }
    }
}