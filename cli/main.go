package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"

	"github.com/PuerkitoBio/goquery"
)

const wiktionaryAPI = "https://vi.wiktionary.org/w/api.php?action=query&format=json&prop=extracts&titles=%s"

var partOfSpeech = map[string]string{
	"Tính_từ":  "Tính từ",
	"Danh_từ":  "Danh từ",
	"Trạng_từ": "Trạng từ",
	"Động_từ":  "Động từ",
	"Giới_từ":  "Giới từ",
	"Liên_từ":  "Liên từ",
	"Đại_từ":   "Đại từ",
	"Thán_từ":  "Thán từ",
	"Phó_từ":   "Phó từ",
	"Mạo_từ":   "Mạo từ",
}

type WikiResponse struct {
	Query struct {
		Pages map[string]struct {
			Extract string `json:"extract"`
		} `json:"pages"`
	} `json:"query"`
}

func fetchWiktionaryEntry(word string) (string, error) {
	url := fmt.Sprintf(wiktionaryAPI, word)
	resp, err := http.Get(url)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var data WikiResponse
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return "", err
	}
	for _, page := range data.Query.Pages {
		return page.Extract, nil
	}
	return "", fmt.Errorf("Không tìm thấy dữ liệu")
}

func extractPronunciation(doc *goquery.Document) []string {
	fmt.Println("Tiếng Anh: ", doc.Find("h2 span#Tiếng_Anh").Parent().Text())
	var ipaList []string
	engSection := doc.Find("h2 span#Tiếng_Anh").Parent()
	fmt.Println(engSection.Text())
	if engSection.Length() == 0 {
		return ipaList
	}
	pronHeading := engSection.NextAllFiltered("h3").Find("span#Cách_phát_âm").Parent()
	fmt.Println(pronHeading.Text())
	if pronHeading.Length() == 0 {
		return ipaList
	}
	ul := pronHeading.NextAllFiltered("ul").First()
	fmt.Println(ul.Text())
	ul.Find("li").Each(func(i int, s *goquery.Selection) {
		fmt.Println(s.Text())
		if strings.Contains(s.Text(), "IPA") {
			ipa := s.Find("span").First().Text()
			if ipa != "" {
				ipaList = append(ipaList, ipa)
			}
		}
	})
	return ipaList
}

func extractPartSections(doc *goquery.Document) map[string][]string {
	results := make(map[string][]string)
	engSection := doc.Find("h2 span#Tiếng_Anh").Parent()
	if engSection.Length() == 0 {
		return results
	}
	for node := engSection.Next(); node.Length() > 0; node = node.Next() {
		if goquery.NodeName(node) == "h2" {
			break
		}
		if goquery.NodeName(node) == "h3" {
			anchor, _ := node.Find("span").Attr("id")
			label, ok := partOfSpeech[anchor]
			if ok {
				var meanings []string
				ol := node.NextFiltered("ol")
				if ol.Length() > 0 {
					ol.Find("li").Each(func(i int, s *goquery.Selection) {
						meaning := s.Text()
						if meaning != "" {
							meanings = append(meanings, meaning)
						}
					})
				} else {
					p := node.NextFiltered("p")
					if p.Length() > 0 {
						meaning := p.Text()
						if meaning != "" {
							meanings = append(meanings, meaning)
						}
					}
				}
				if len(meanings) > 0 {
					results[label] = meanings
				}
			}
		}
	}
	return results
}

func lookupWord(word string) {
	extract, err := fetchWiktionaryEntry(word)
	if err != nil {
		fmt.Println("⚠️ Không thể lấy dữ liệu từ Wiktionary.")
		return
	}
	if extract == "" {
		fmt.Println("❌ Không có nội dung từ.")
		return
	}

	doc, err := goquery.NewDocumentFromReader(strings.NewReader(extract))
	if err != nil {
		fmt.Println("❌ Lỗi khi phân tích HTML.")
		return
	}
	fmt.Printf("\n🔤 Từ: %s\n", strings.ToUpper(word))

	ipaList := extractPronunciation(doc)
	if len(ipaList) > 0 {
		fmt.Println("\n🔊 Phát âm (IPA):")
		for _, ipa := range ipaList {
			fmt.Printf(" 📝 %s\n", ipa)
		}
	}

	results := extractPartSections(doc)
	if len(results) == 0 {
		fmt.Println("❌ Không có phần loại từ nào phù hợp.")
		return
	}
	for part, meanings := range results {
		fmt.Printf("\n📌 %s:\n", part)
		for i, meaning := range meanings {
			fmt.Printf(" %d. %s\n", i+1, meaning)
		}
	}
	fmt.Println("\n" + strings.Repeat("🌟", 20) + "\n")
}

func main() {
	// Bắt Ctrl+C để thoát đẹp
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-c
		fmt.Println("\nĐã thoát chương trình. Tạm biệt!")
		os.Exit(0)
	}()

	fmt.Println("Nhập 'quit' hoặc nhấn Ctrl+C để thoát.")
	scanner := bufio.NewScanner(os.Stdin)
	for {
		fmt.Print("Nhập từ tiếng Anh cần tra cứu: ")
		if !scanner.Scan() {
			break
		}
		word := strings.TrimSpace(scanner.Text())
		if word == "" {
			continue
		}
		if strings.ToLower(word) == "quit" || strings.ToLower(word) == "exit" {
			fmt.Println("Tạm biệt!")
			break
		}
		lookupWord(word)
	}
}
