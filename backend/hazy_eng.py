import requests
import os

TOKEN_FILE = 'token.txt'

def get_token_from_file():
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE, 'r') as f:
            token = f.read().strip()
            if token:
                return token
    return None

def login_and_save_token(username, password):
    url = 'https://hazy-eng.apifree.site/api/token'
    headers = {'accept': 'application/json, text/plain, */*'}
    data = {'username': username, 'password': password}
    response = requests.post(url, headers=headers, data=data)
    if response.status_code == 200:
        token = response.json().get('access_token')
        if token:
            with open(TOKEN_FILE, 'w') as f:
                f.write(token)
            return token
    print('Lỗi khi lấy token hoặc đăng nhập không thành công')
    return None

def get_token(username, password):
    token = get_token_from_file()
    if token:
        return token
    return login_and_save_token(username, password)

def lookup_word(word, token):
    url = f'https://hazy-eng.apifree.site/api/lookup?word={word}'
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.post(url, headers=headers)
    if response.status_code != 200:
        print(f'Không tìm thấy từ hoặc có lỗi khi truy cập API. Status code: {response.status_code}')
        print('Response:', response.text)
        return
    data = response.json()
    print(f"🔤 Từ: {data.get('word', word).upper()}")
    print(f"🇻🇳 Nghĩa tiếng Việt: {data.get('vietnamese_word', 'Không có')}")
    wiki_url = data.get('source_urls', [''])[0]
    if wiki_url:
        print(f"📚 Link Wiktionary: {wiki_url}")
    phonetics = data.get('phonetics', [])
    if phonetics:
        print("\n🔊 Phát âm:")
        for p in phonetics:
            if p.get('text'):
                print(f" 📝 {p['text']}")
            if p.get('audio'):
                print(f" 🎵 Audio: {p['audio']}")
    meanings = data.get('meanings', [])
    if meanings:
        print("\n📖 Các nghĩa:")
        for m in meanings:
            pos = m.get('part_of_speech', 'Không rõ')
            print(f" 📌 {pos.capitalize()}:")
            definitions = m.get('definitions', [])
            for i, d in enumerate(definitions, 1):
                print(f" {i}. {d.get('definition', 'Không có')}")
                if d.get('vietnamese'):
                    print(f" ➡️ {d['vietnamese']}")
                if d.get('example'):
                    print(f" 💬 {d['example']}")
                if d.get('example_vietnamese'):
                    print(f" 💭 {d['example_vietnamese']}")
            print()
    print("\n" + "🌟" * 20 + "\n")

if __name__ == "__main__":
    username = ''
    password = ''
    token = get_token(username, password)
    if token:
        print("Nhập 'quit' hoặc nhấn Ctrl+C để thoát.")
        while True:
            try:
                word = input("Nhập từ tiếng Anh cần tra cứu: ").strip()
                if word.lower() in ['quit', 'exit']:
                    print("Tạm biệt!")
                    break
                if word == '':
                    continue
                lookup_word(word, token)
            except KeyboardInterrupt:
                print("\nĐã thoát chương trình. Tạm biệt!")
                break
    else:
        print('Không lấy được token, không thể tra cứu từ.')
