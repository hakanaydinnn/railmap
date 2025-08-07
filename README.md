# hakan-aydin-2025
RAILMAP İSTANBUL PROJESİ

Projenin Amacı: 
Bu projede İstanbul’da bulunan raylı sistemleri harita bazlı gösterimini sağlayan ve rotalarını görebileceğiniz bir sistem yapılmaktadır. Dileyen kullanıcı Raylı Sistem Hatlarını aratabilir, hatta bulanın istasyonları görebilir ve bu istasyondan geçen sistemleri görebilir. Bu sayede hangi istasyondan ulaşım sağlayabileceğini öğrenebilir.

Projenin Özellikleri:
1) Kullanıcı istasyonları harita üzerinde görebilir.
2) İstasyondan geçen hatları harita üzerinden görebilir. 
3) Arama yaparak istasyon veya hatları aratabilir.
4) Kullanıcı dilerse hatları ilçe bazlı filtreleyebilir ve harita üzerinde karmaşık gözükmesini engelleyebilir.
5) İstasyon bazlı hangi metronun o istasyondan geçeceğini ve sefer saatlerini görüntüleyebilir.

PROJE ROADMAP:

A) PLANLAMA VE GEREKSİNİMLER

   1. Temel Özelliklerin Belirlenmesi
 Harita üzerinde istasyonları göster.
 Hatları ve hat tiplerini göster.
 Arama özelliği (hat/istasyon bazlı).
 İlçe bazlı filtreleme.
 Sefer saatlerini gösterme.

   2. Veri Kaynaklarının Hazırlanması
 hatlar.geojson: Metro, tramvay vb. tüm hat bilgileri
 istasyonlar.geojson: Noktasal istasyon verileri
 sefer_saatleri.json: Her istasyon için tren saatleri (örnek verilerle başlanabilir)
 İlçelere göre istasyon eşleştirmesi (gerekirse ters geocode ile)

B) HARİTA ALTYAPISI VE GÖRSELLEŞTİRME

   3. Harita Kurulumu (MapLibre) V0.0.1
 MapLibre entegrasyonu +
 Temel harita görünümü (Maptiler/Custom Tile) +
 Zoom / Pan kontrolü +

   4. Veri Katmanlarının Eklenmesi V0.0.2
 istasyon.geojson → circle layer ile gösterim +
 hatlar.geojson → line layer + PROJE_TURU'na göre renkli stil +

   5. Pop-up Bilgilerinin Eklenmesi V0.0.3
 İstasyona tıklanınca: istasyon adı, hat adı, hat türü +
 Hattı tıklayınca: hat adı, türü +

C) ETKİLEŞİMSEL ÖZELLİKLER

   6. Arama Özelliği V0.1.1
 Arama kutusu (input) +
 İstasyon adına göre arama → istasyon konumuna zoom +
 Hat adına göre arama → hattı öne çıkar / vurgula +

   7. Sefer Saatlerini Gösterme V0.1.2
 Tıklanan istasyon için
 Pop-up içinde sefer saatlerine gidebileceğin link +

D) EK ÖZELLİKLER VE DETAYLANDIRMA

   8. Filtreleme Özelliği V0.1.3
 Bir hatta veya istasyona tıklandığında haritadaki geriye kalan tüm proplar silinecek sadece vurgulanan hat ya da istasyon görünür +
 Arama çubuğunda hat veya istasyon arandığında haritadaki geriye kalan tüm proplar silinecek sadece vurgulanan hat ya da istasyon görünür +

   9. İsim Normalizasyonu V0.1.4
 hatlar.geojson ve istasyon.geosjon Dosyasındaki birbiri ile aynı olan fakat 
 isim olarak farklılık gösteren istasyonlarda normalizasyon (eşitleme) +

E) KULLANICI ARAYÜZÜ VE DOKÜMANTASYON

   10. Arayüz İyileştirmeleri
 Responsive tasarım
 Harita dışı kontrollerin düzeni (arama, filtre)
 İkon ve renk düzenlemeleri

   11. Kullanıcı Rehberi ve Dokümantasyon
 Kullanım talimatları
 Hangi verinin nereden geldiği
 Kod yapısı açıklamaları

OPSİYONEL: Gelişmiş Özellikler (Ekstra zaman varsa)
     Konuma göre en yakın istasyonu göster
     Zamanlayıcı: “10 dk sonra geçen ilk tren”