package expo.modules.ringtonepicker

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.media.RingtoneManager
import android.net.Uri
import expo.modules.kotlin.Promise
import expo.modules.kotlin.activityresult.AppContextActivityResultContract
import expo.modules.kotlin.activityresult.AppContextActivityResultLauncher
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * Launches Android's own alarm-sound picker (the same UI the system Clock app
 * uses). Input is the currently selected URI, or an empty string for "none".
 * Result is the picked URI, or null if the user cancelled.
 */
private class RingtonePickerContract : AppContextActivityResultContract<String, Uri?> {
  override fun createIntent(context: Context, input: String): Intent {
    val defaultUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
    val existing = if (input.isNotEmpty()) Uri.parse(input) else defaultUri
    return Intent(RingtoneManager.ACTION_RINGTONE_PICKER).apply {
      putExtra(RingtoneManager.EXTRA_RINGTONE_TYPE, RingtoneManager.TYPE_ALARM)
      putExtra(RingtoneManager.EXTRA_RINGTONE_SHOW_DEFAULT, true)
      putExtra(RingtoneManager.EXTRA_RINGTONE_SHOW_SILENT, false)
      putExtra(RingtoneManager.EXTRA_RINGTONE_EXISTING_URI, existing)
      putExtra(RingtoneManager.EXTRA_RINGTONE_DEFAULT_URI, defaultUri)
    }
  }

  override fun parseResult(input: String, resultCode: Int, intent: Intent?): Uri? {
    if (resultCode != Activity.RESULT_OK) return null
    @Suppress("DEPRECATION")
    return intent?.getParcelableExtra(RingtoneManager.EXTRA_RINGTONE_PICKED_URI) as? Uri
  }
}

class RingtonePickerModule : Module() {
  private lateinit var ringtoneLauncher: AppContextActivityResultLauncher<String, Uri?>

  override fun definition() = ModuleDefinition {
    Name("RingtonePicker")

    RegisterActivityContracts {
      ringtoneLauncher = registerForActivityResult(RingtonePickerContract())
    }

    AsyncFunction("pickAlarmRingtone") { currentUri: String?, promise: Promise ->
      CoroutineScope(Dispatchers.Main).launch {
        val uri = ringtoneLauncher.launch(currentUri ?: "")
        promise.resolve(uri?.toString())
      }
    }

    // Human-readable name for a ringtone URI (e.g. "Bright morning"), used to show
    // the currently selected sound in Settings.
    AsyncFunction("getRingtoneTitle") { uriString: String ->
      val context = appContext.reactContext
      if (context == null) {
        null
      } else {
        val uri = Uri.parse(uriString)
        RingtoneManager.getRingtone(context, uri)?.getTitle(context)
      }
    }

    AsyncFunction("getDefaultAlarmRingtoneUri") {
      RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)?.toString()
    }
  }
}
