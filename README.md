
# Link2Ink Studio 🚀

Link2Ink, karmaşık veri kaynaklarını (GitHub Repoları, Web Makaleleri, YouTube Videoları) saniyeler içinde **mobil öncelikli**, yüksek çözünürlüklü ve **okunabilir profesyonel infografiklere** dönüştüren gelişmiş bir Görsel Zeka Platformudur.

## 🧠 Yapay Zeka Mimarisi & Modeller

Bu proje, Google'ın en yeni nesil **Gemini** modellerini hibrit bir yapıda (Multimodal Pipeline) kullanır.

### 1. Metin Analizi & Akıl Yürütme (`gemini-3-pro-preview`)
Bu model, uygulamanın "Analitik Beyni" olarak çalışır.
*   **Repo Analizi:** GitHub dosya ağacını (File Tree) tarar, mimari desenleri tanır ve teknik özet çıkarır.
*   **VideoAnaliz (Hibrit):** Öncelikle **Video Transkriptini** ve doğrudan içeriği analiz etmeyi dener. Eğer erişilemezse, **Deep Grounding** moduna geçerek web üzerindeki verileri ve özetleri çapraz sorgular.
*   **İçerik Damıtma:** Uzun makaleleri; başlık, kritik istatistikler ve aksiyon maddelerine dönüştürür.
*   **Thinking Config:** Karmaşık kod yapılarında "düşünme bütçesi" kullanarak daha derinlemesine analiz yapar.

### 2. Görsel Üretim (`gemini-3-pro-image-preview`)
Bu model, uygulamanın "Sanat Yönetmeni" olarak çalışır.
*   **Tipografi Yeteneği:** Standart görsel modellerinin aksine, *okunabilir*, *doğru yazılmış* ve *yerleşimi düzgün* metinler içeren grafikler üretir.
*   **Çözünürlük:** 2K (2048x2048) çözünürlükte net çıktılar sağlar.
*   **Format Esnekliği:** Kullanıcının seçimine göre `16:9` (Yatay/Masaüstü) veya `9:16` (Dikey/Hikaye) formatında çalışır.

---

## 🌊 Uygulama Akış Şemaları

### A. KodAkışı (Repo Analyzer)
Kodu okumadan anlamayı sağlayan modül.

```mermaid
graph TD
    A[Kullanıcı: GitHub Repo URL] --> B[GitHub API (Tree Fetch)]
    B --> C{Veri İşleme}
    C -->|Teknik Yapı| D[Gemini 3 Pro (Text)]
    C -->|Görsel Kompozisyon| E[Gemini 3 Pro Image]
    D --> F[Mimari Özet & Özellik Listesi]
    E --> G[2K Mimari Diyagram / Ürün Posteri]
    F & G --> H[UI: Split View Sonuç]
```

### B. VideoAnaliz (YouTube Deep Grounding)
Videoyu izlemeden görselleştiren modül.

```mermaid
graph TD
    A[Video URL / ID] --> B[Regex Ayrıştırıcı]
    B --> C[Gemini 3 Pro (Thinking)]
    C -->|Tool Call| D[Google Search Grounding]
    D -->|Metadata, Snippets, Reviews| C
    C -->|Yapılandırılmış Veri| E[Prompt Mühendisliği]
    E --> F[Gemini 3 Pro Image]
    F --> G[İnfografik Poster]
```

### C. İnfografikçi (Article to Ink)
Web içeriğini görselleştiren modül.

```mermaid
graph TD
    A[URL / Dosya / Metin] --> B[Gemini 3 Pro]
    B -->|Search Tool| C[Google Search (Güncel Veri)]
    B --> D[Veri Madenciliği (İstatistikler, Alıntılar)]
    D --> E[Görsel Tasarım Promptu]
    E --> F[Gemini 3 Pro Image]
    F --> G[Final İnfografik]
```

## 🛠 Teknoloji Yığını

*   **Frontend:** React 19, TypeScript, Vite
*   **UI Framework:** Tailwind CSS (Glassmorphism & Neon Estetik)
*   **AI SDK:** Google GenAI SDK (`@google/genai`)
*   **Veri Görselleştirme:** D3.js (İnteraktif Node Grafikleri için)
*   **İkon Seti:** Lucide React

## 📦 Kurulum ve Çalıştırma

1.  Proje dosyalarını indirin.
2.  Gerekli paketleri yükleyin:
    ```bash
    npm install
    ```
3.  Geliştirme sunucusunu başlatın:
    ```bash
    npm run dev
    ```
4.  Uygulama başladığında, **Google AI Studio** entegrasyonu otomatik olarak devreye girecek ve sizden (Pro modelleri kullanabilmek için) faturalı bir projeye bağlı API anahtarını seçmenizi isteyecektir.

## 🎨 Temel Özellikler

*   **KodAkışı:** Repoları teknik diyagramlara veya "Ürün Tanıtım Posterlerine" dönüştürür.
*   **İnfografikçi:** URL, PDF veya Metin girdilerini stilize edilmiş görsellere çevirir.
*   **VideoAnaliz:** YouTube videolarını analiz edip görsel özet çıkarır.
*   **Reality Engine:** Mevcut görselleri yükleyip stil transferi (örn: "Bunu Cyberpunk yap") ile yeniden çizer.
*   **DevStudio:** Reponuzla sohbet etmenizi sağlayan interaktif D3.js grafiği.

## 💎 Lisans

Bu proje Apache-2.0 lisansı altında lisanslanmıştır.
