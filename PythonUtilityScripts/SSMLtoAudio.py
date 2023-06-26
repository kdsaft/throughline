import os
import re
import azure.cognitiveservices.speech as speechsdk

def speech_synthesizer_word_boundary_cb(evt: speechsdk.SessionEventArgs):
    word_timing = {
        'AudioOffset': (evt.audio_offset + 5000) // 10000,
        'Duration': evt.duration.total_seconds() * 1000,
        'Text': evt.text
    }
    word_timings.append(word_timing)

def speech_synthesizer_bookmark_reached_cb(evt: speechsdk.SessionEventArgs):
    bookmark_timing = {
        'AudioOffset': (evt.audio_offset + 5000) // 10000,
        'Bookmark': evt.text
    }
    bookmark_timings.append(bookmark_timing)


def synthesize_ssml_to_audio_with_timestamps(subscription_key, region, ssml_file_path):
    global word_timings, bookmark_timings
    word_timings = []
    bookmark_timings = []

    speech_config = speechsdk.SpeechConfig(subscription=subscription_key, region=region)
    speech_config.set_property(property_id=speechsdk.PropertyId.SpeechServiceResponse_RequestSentenceBoundary, value='true')

    # Get file name and directory
    file_name = os.path.basename(ssml_file_path)
    file_name_no_ext = os.path.splitext(file_name)[0]
    file_directory = os.path.dirname(ssml_file_path)

    audio_file_path = os.path.join(file_directory, file_name_no_ext + '.wav')
    timings_file_path = os.path.join(file_directory, file_name_no_ext + '_timings.txt')
    bookmark_timings_file_path = os.path.join(file_directory, file_name_no_ext + '_bookmark_timings.txt')


    audio_config = speechsdk.audio.AudioOutputConfig(filename=audio_file_path)
    speech_synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=audio_config)

    speech_synthesizer.synthesis_word_boundary.connect(speech_synthesizer_word_boundary_cb)
    speech_synthesizer.bookmark_reached.connect(speech_synthesizer_bookmark_reached_cb)

    # Load SSML from file
    with open(ssml_file_path, 'r') as ssml_file:
        ssml = ssml_file.read()

    # Extract voice name from SSML
    voice_name_pattern = re.compile(r'<voice name=\'(.*?)\'>')
    match = voice_name_pattern.search(ssml)
    speech_synthesis_voice_name = match.group(1) if match else 'en-US-JennyNeural'

    # Synthesize the SSML
    speech_synthesis_result = speech_synthesizer.speak_ssml_async(ssml).get()

    # Check for audio synthesis completion
    if speech_synthesis_result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
        print("SynthesizingAudioCompleted result")

        # Save word timings to file
        with open(timings_file_path, 'w') as f:
            for timing in word_timings:
                f.write(str(timing) + '\n')

        # Save bookmark timings to file
        with open(bookmark_timings_file_path, 'w') as f:
            for timing in bookmark_timings:
              f.write(str(timing) + '\n')

    elif speech_synthesis_result.reason == speechsdk.ResultReason.Canceled:
        cancellation_details = speech_synthesis_result.cancellation_details
        print("Speech synthesis canceled: {}".format(cancellation_details.reason))
        if cancellation_details.reason == speechsdk.CancellationReason.Error:
            if cancellation_details.error_details:
                print("Error details: {}".format(cancellation_details.error_details))


if __name__ == "__main__":
    subscription_key = "bdb8bfbfafa74fa39e46d676edf2787b"
    region = "eastus"
    ssml_file_path = "/Users/keith/TL-GIT/throughline/ssml/hierarchical.ssml"

    synthesize_ssml_to_audio_with_timestamps(subscription_key, region, ssml_file_path)
