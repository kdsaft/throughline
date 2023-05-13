import json

base_file_name = "PieThatConquered"

# Read and parse both JSON files into dictionaries
with open(f"{base_file_name}_toUpdate.json", 'r') as file_to_be_updated:
    main_data = json.load(file_to_be_updated)

with open(f"{base_file_name}_newData.json", 'r') as file_with_new_data:
    new_data = json.load(file_with_new_data)

# Iterate through the words in both dictionaries simultaneously using zip
for main_word, new_word in zip(main_data['words'], new_data['Words']):
    if main_word['word'].lower() == new_word['Word'].lower():
        main_word['startTime'] = new_word['Offset'] / 1000000
        main_word['duration'] = new_word['Duration'] / 1000000
        
            # Remove the incorrect 'start_time' key if it exists
    if 'start_time' in main_word:
        del main_word['start_time']

        
        # Update phonemes
        new_phonemes = new_word['Phonemes']
        main_phonemes = [phoneme for syllable in main_word['syllables'] for phoneme in syllable['phonemes']]
        main_phoneme_index = 0

        for new_phoneme in new_phonemes:
            if main_phoneme_index < len(main_phonemes) and main_phonemes[main_phoneme_index] == new_phoneme['Phoneme']:
                main_phonemes[main_phoneme_index] = new_phoneme['Phoneme']
                main_phoneme_index += 1

        main_phoneme_index = 0
        for syllable in main_word['syllables']:
            for i in range(len(syllable['phonemes'])):
                syllable['phonemes'][i] = main_phonemes[main_phoneme_index]
                main_phoneme_index += 1

# Write the updated main_data back to the main JSON file
with open(f"{base_file_name}.json", 'w') as updated_file:
    json.dump(main_data, updated_file, indent=4, ensure_ascii=False)
