import requests
from bs4 import BeautifulSoup

WIKTIONARY_API = "https://vi.wiktionary.org/w/api.php?action=query&format=json&prop=extracts&titles={word}"
DICTIONARY_API = "https://api.dictionaryapi.dev/api/v2/entries/en/{word}"

PARTS_OF_SPEECH = {
    "Tính_từ": "Tính từ",
    "Danh_từ": "Danh từ",
    "Trạng_từ": "Trạng từ",
    "Động_từ": "Động từ",
    "Giới_từ": "Giới từ",
    "Liên_từ": "Liên từ",
    "Đại_từ": "Đại từ",
    "Thán_từ": "Thán từ",
    "Phó_từ": "Phó từ",
    "Ngoại_động_từ": "Ngoại động từ",
    "Nội_động_từ": "Nội động từ",
    "Mạo_từ": "Mạo từ"
}

from typing import Dict, List, Optional, Union

def fetch_wiktionary_entry(word: str) -> Optional[dict]:
    """
    Fetches word entry data from Wiktionary API.

    Args:
        word (str): The word to look up in Wiktionary

    Returns:
        dict | None: JSON response from Wiktionary API if successful, None otherwise
    """
    url = WIKTIONARY_API.format(word=word)
    response = requests.get(url)
    if response.status_code != 200:
        print("⚠️ Không thể lấy dữ liệu từ Wiktionary.")
        return None
    return response.json()

def fetch_dictionary_entry(word: str) -> Optional[dict]:
    """
    Fetches word entry data from Dictionary API.

    Args:
        word (str): The word to look up in Dictionary API

    Returns:
        dict | None: JSON response from Dictionary API if successful, None otherwise
    """
    url = DICTIONARY_API.format(word=word)
    response = requests.get(url)
    if response.status_code != 200:
        print("⚠️ Không thể lấy dữ liệu từ Dictionary API.")
        return None
    return response.json()

def extract_pronunciation(soup: BeautifulSoup) -> List[str]:
    """
    Extracts IPA pronunciation from the Wiktionary HTML content.

    Args:
        soup (BeautifulSoup): Parsed HTML content of the Wiktionary page

    Returns:
        list[str]: List of IPA pronunciation strings
    """
    eng_section = soup.find("h2", {"data-mw-anchor": "Tiếng_Anh"})
    if not eng_section:
        return []

    ipa_list = []
    pron_heading = eng_section.find_next("h3", {"data-mw-anchor": "Cách_phát_âm"})
    if not pron_heading:
        return []

    ul = pron_heading.find_next("ul")
    if ul:
        for li in ul.find_all("li"):
            if "IPA" in li.text:
                ipa_text = li.find("span")
                if ipa_text:
                    ipa_list.append(ipa_text.text.strip())
    return ipa_list

def extract_part_sections(soup: BeautifulSoup, part_map: Dict[str, str]) -> Dict[str, List[Dict[str, Union[str, List[str]]]]]:
    """
    Extracts word definitions and examples organized by part of speech.

    Args:
        soup (BeautifulSoup): Parsed HTML content of the Wiktionary page
        part_map (dict[str, str]): Mapping of part of speech identifiers to their display names

    Returns:
        dict[str, list[dict[str, str | list[str]]]]: Dictionary mapping parts of speech to their definitions and examples
    """
    results = {}
    eng_section = soup.find("h2", {"data-mw-anchor": "Tiếng_Anh"})
    if not eng_section:
        print("❌ Không tìm thấy phần Tiếng Anh.")
        return results

    # Duyệt các phần sau Tiếng Anh
    current_tag = eng_section.find_next_sibling()
    while current_tag:
        if current_tag.name == "h2":  # Kết thúc phần tiếng Anh
            break
        if current_tag.name == "h3":
            anchor = current_tag.get("data-mw-anchor")
            if anchor in part_map:
                part_label = part_map[anchor]
                meanings = []
                
                # Handle different possible structures
                ol_tag = current_tag.find_next("ol")
                p_tag = current_tag.find_next("p")
                
                # Case 1: Structure with <ol><li>...</li></ol>
                if ol_tag:
                    for li in ol_tag.find_all("li", recursive=False):
                        meaning_text = ""
                        if li.contents:
                            # Get text content while preserving HTML formatting
                            meaning_text = ''.join(str(content) for content in li.contents if not hasattr(content, 'name') or content.name != 'dl').strip()
                            meaning_text = BeautifulSoup(meaning_text, 'html.parser').get_text().strip()
                        
                        examples = []
                        dl = li.find("dl")
                        if dl:
                            for dd in dl.find_all("dd"):
                                ex_text = dd.get_text(strip=True)
                                if ex_text:
                                    examples.append(ex_text)
                                    
                        if meaning_text or examples:  # Only add if there's meaningful content
                            meanings.append({
                                "meaning": meaning_text,
                                "examples": examples
                            })
                # Case 2: Structure with just <p> after h3
                elif p_tag and not ol_tag:
                    meaning_text = p_tag.get_text(strip=True)
                    if meaning_text:
                        meanings.append({
                            "meaning": meaning_text,
                            "examples": []
                        })
                
                if meanings:  # Only add to results if we found meanings
                    results[part_label] = meanings
                    
        current_tag = current_tag.find_next_sibling()
    return results

def lookup_word(word: str) -> None:
    """
    Looks up a word in Wiktionary and displays its pronunciation and definitions.

    Args:
        word (str): The word to look up
    """
    data = fetch_wiktionary_entry(word)
    if not data:
        return

    dictionary_data = fetch_dictionary_entry(word)
    if not dictionary_data:
        return
    
    # Extract the first available audio URL from phonetics
    audio_url = None
    if isinstance(dictionary_data, list) and len(dictionary_data) > 0:
        for entry in dictionary_data:
            if 'phonetics' in entry and isinstance(entry['phonetics'], list):
                for phonetic in entry['phonetics']:
                    if 'audio' in phonetic and phonetic['audio']:  # Check if audio exists and is not empty
                        audio_url = phonetic['audio']
                        break
                if audio_url:
                    break

    page = next(iter(data["query"]["pages"].values()))
    if "extract" not in page:
        print("❌ Không có nội dung từ.")
        return


    print(f"\n🔤 Từ: {word.upper()}")
    soup = BeautifulSoup(page["extract"], "html.parser")

    # Phát âm
    ipa_list = extract_pronunciation(soup)
    if ipa_list:
        print("\n🔊 Phát âm (IPA):")
        for ipa in ipa_list:
            print(f" 📝 {ipa}\n")

    if audio_url:
        print(f"🔊 Phát âm (Audio): {audio_url}")

    # Nghĩa chia theo loại từ
    results = extract_part_sections(soup, PARTS_OF_SPEECH)
    if not results:
        print("❌ Không có phần loại từ nào phù hợp.")
        return

    for part, meanings in results.items():
        print(f"\n📌 {part}:")
        for i, m in enumerate(meanings, 1):
            print(f" {i}. {m['meaning']}")
            for ex in m["examples"]:
                print(f"    💬 {ex}")
    print("\n" + "🌟" * 20 + "\n")

if __name__ == "__main__":
    print("Nhập 'quit' hoặc nhấn Ctrl+C để thoát.")
    while True:
        try:
            word = input("Nhập từ tiếng Anh cần tra cứu: ").strip()
            if word.lower() in ['quit', 'exit']:
                print("Tạm biệt!")
                break
            if word == '':
                continue
            lookup_word(word)
        except KeyboardInterrupt:
            print("\nĐã thoát chương trình. Tạm biệt!")
            break