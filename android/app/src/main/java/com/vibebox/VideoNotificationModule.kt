package com.vibebox

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class VideoNotificationModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val CHANNEL_ID = "video_playback_channel"
        const val NOTIFICATION_ID = 2001
        private const val EVENT_PLAY_PRESSED = "onPlayPressed"
        private const val EVENT_PAUSE_PRESSED = "onPausePressed"
        private const val EVENT_STOP_PRESSED = "onStopPressed"
    }

    private var notificationManager: NotificationManager? = null

    init {
        notificationManager = reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        createNotificationChannel()
    }

    override fun getName(): String {
        return "VideoNotificationModule"
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Reproducción de Video",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Controles de reproducción de video"
                setShowBadge(false)
            }
            notificationManager?.createNotificationChannel(channel)
        }
    }

    @ReactMethod
    fun showNotification(title: String, isPlaying: Boolean) {
        val context = reactApplicationContext

        // Intent para abrir la app
        val intent = context.packageManager.getLaunchIntentForPackage(context.packageName)
        val pendingIntent = PendingIntent.getActivity(
            context,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Intent para Play
        val playIntent = Intent(context, VideoNotificationReceiver::class.java).apply {
            action = "ACTION_PLAY"
        }
        val playPendingIntent = PendingIntent.getBroadcast(
            context,
            0,
            playIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Intent para Pause
        val pauseIntent = Intent(context, VideoNotificationReceiver::class.java).apply {
            action = "ACTION_PAUSE"
        }
        val pausePendingIntent = PendingIntent.getBroadcast(
            context,
            1,
            pauseIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Intent para Stop
        val stopIntent = Intent(context, VideoNotificationReceiver::class.java).apply {
            action = "ACTION_STOP"
        }
        val stopPendingIntent = PendingIntent.getBroadcast(
            context,
            2,
            stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText("Reproduciendo video")
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .addAction(
                if (isPlaying) android.R.drawable.ic_media_pause else android.R.drawable.ic_media_play,
                if (isPlaying) "Pausar" else "Reproducir",
                if (isPlaying) pausePendingIntent else playPendingIntent
            )
            .addAction(
                android.R.drawable.ic_menu_close_clear_cancel,
                "Cerrar",
                stopPendingIntent
            )
            .setStyle(androidx.media.app.NotificationCompat.MediaStyle()
                .setShowActionsInCompactView(0, 1))
            .build()

        notificationManager?.notify(NOTIFICATION_ID, notification)
    }

    @ReactMethod
    fun hideNotification() {
        notificationManager?.cancel(NOTIFICATION_ID)
    }

    @ReactMethod
    fun updatePlaybackState(isPlaying: Boolean) {
        // La notificación se actualiza llamando a showNotification de nuevo
    }

    fun sendEvent(eventName: String) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, null)
    }
}
