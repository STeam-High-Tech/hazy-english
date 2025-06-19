import requests
from bs4 import BeautifulSoup

WIKTIONARY_API = "https://vi.wiktionary.org/w/api.php?action=query&format=json&prop=extracts&titles={word}"

# Danh sách các loại từ bạn muốn tách ra (theo thứ tự ưu tiên)
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
    "Mạo_từ": "Mạo từ"
}

def fetch_wiktionary_entry(word):
    url = WIKTIONARY_API.format(word=word)
    response = requests.get(url)
    if response.status_code != 200:
        print("⚠️ Không thể lấy dữ liệu từ Wiktionary.")
        return None
    return response.json()

def extract_pronunciation(soup):
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

def extract_part_sections(soup, part_map):
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

def lookup_word(word):
    data = fetch_wiktionary_entry(word)
    if not data:
        return

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
            print(f" 📝 {ipa}")

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