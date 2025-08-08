const sinirBounds = [
  [27.8, 40.7],
  [30.3, 41.6]
];

const map = new maplibregl.Map({
  container: 'map',
  style: 'https://api.maptiler.com/maps/basic/style.json?key=BdEw1pyPhy630u9MGeP7',
  center: [29.01899, 41.02302],
  minZoom: 9.5,
  maxZoom: 15,
  maxBounds: sinirBounds
});

map.on("load", async () => {
  let kullaniciKonum = null;
  let istasyonlar = null;
  let rotaMarkerlar = [];
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userCoords = [position.coords.longitude, position.coords.latitude];
      kullaniciKonum = userCoords;

      // Kullanıcının konumunu göster
      new maplibregl.Marker({ color: "#002f6c" })
        .setLngLat(userCoords)
        .setPopup(new maplibregl.Popup().setText("Şu anki konumunuz"))
        .addTo(map);

      map.flyTo({ center: userCoords, zoom: 14 });
    },
    (error) => {
      console.warn("Konum alınamadı:", error);
    },
    { enableHighAccuracy: true }
  );


  let aktifHatAdi = null;
  const hatKurallari = [
    {
      keywords: ["marmaray", "yüzeysel"],
      hatAdi: "Halkalı - Gebze Marmaray Yüzeysel Raylı Sistem Hattı",
    },
    {
      keywords: [["yenikapı", "kirazlı"], ["otogar -"]],
      hatAdi: "M1B Yenikapı - Kirazlı Metro Hattı",
    },
    {
      keywords: ["seyrantepe", "hacıosman"],
      hatAdi: "M2 Yenikapı Seyrantepe - Hacıosman Metro Hattı",
    },
    {
      keywords: ["yenikapı", "atatürk"],
      hatAdi: "M1A Yenikapı - Atatürk Havalimanı Metro Hattı",
    },
    {
      keywords: [["kirazlı", "bakırköy"], ["kayaşehir", "merkez"], ["ido"]],
      hatAdi: "M3 Bakırköy - Kayaşehir Merkez Metro Hattı",
    },
    {
      keywords: [["kadıköy", "sgh"]],
      hatAdi: "M4 Kadıköy - Sabiha Gökçen Havalimanı Metro Hattı",
    },
    {
      keywords: [["kaynarca", "pendik"]],
      hatAdi: "M4 Tavşantepe - Tuzla Metro Hattı Uzatması",
    },
    {
      keywords: [["üsküdar", "çekmeköy"], ["sultanbeyli"], ["samandıra"]],
      hatAdi: "M5 Üsküdar - Samandıra Metro Hattı",
    },
    {
      keywords: [["levent", "boğaziçi"]],
      hatAdi: "M6 Levent - Boğaziçi Ü./Hisarüstü Metro Hattı",
    },
    {
      keywords: [["bostancı"], ["dudullu"]],
      hatAdi: "M8 Bostancı - Parseller Metro Hattı",
    },
    {
      keywords: [["bahariye"], ["olimpiyat"]],
      hatAdi: "M9 Ataköy - Olimpiyat Metro Hattı",
    },
    {
      keywords: [["gayrettepe", "havalimanı"]],
      hatAdi: "M11 Gayrettepe - İstanbul Hvl. - Arnavutköy Metro Hattı",
    },
    {
      keywords: [["karaköy - beyoğlu tünel"]],
      hatAdi: "F2 Karaköy - Beyoğlu Füniküler Hattı",
    },
    {
      keywords: [["eyüp - pier loti"]],
      hatAdi: "TF2 Eyüp - Pier Loti Teleferik Hattı",
    },
    {
      keywords: [["eminönü", "alibeyköy"], ["eyüp"]],
      hatAdi: "T5 Eminönü - Alibeyköy Tramvay Hattı",
    }
  ];

  function istasyonHatAdi(projeAdi) {
    const text = (projeAdi || "").toLowerCase();

    for (const kural of hatKurallari) {
      for (const keywordSet of kural.keywords) {
        if (Array.isArray(keywordSet)) {
          if (keywordSet.every(k => text.includes(k))) {
            return kural.hatAdi;
          }
        } else {
          if (text.includes(keywordSet)) {
            return kural.hatAdi;
          }
        }
      }
    }
    return projeAdi;
  }

  const loader = document.getElementById("loader");
  const percentageText = document.getElementById("percentage");

  loader.style.display = "flex";  // loader'ı göster
  let percent = 0;

  // Yüzdeyi artıran animasyon
  const simulateLoading = setInterval(() => {
    percent = Math.min(percent + Math.floor(Math.random() * 10), 90);
    percentageText.textContent = percent + "%";
  }, 100);

  // Verileri çek
  const API = "https://seninapp.railway.app";
  const fetchedIstasyon = await fetch(`${API}/istasyonlar/`).then(r => r.json());
  const fetchedHat = await fetch(`${API}/hatlar/`).then(r => r.json());

  // Geçerli veri geldi mi kontrol et
  const istasyonValid = fetchedIstasyon.length > 0;
  const hatValid = fetchedHat.length > 0;

  if (!istasyonValid || !hatValid) {
    clearInterval(simulateLoading);
    percentageText.textContent = "İstasyon veya hat verisi yüklenemedi.";
    loader.querySelector(".spinner").style.animation = "none";
    return;
  }

  // Yükleme başarılıysa animasyonu tamamla
  clearInterval(simulateLoading);
  percentageText.textContent = "100%";

  // önce opaklığı sıfırla (fade-out başlat)
  loader.style.opacity = "0";

  // 500ms sonra display: none yap
  setTimeout(() => {
    loader.style.display = "none";
  }, 500);

  // Sefer saatleri ile hat eşleştirme listesi
  const hatLinkleri = {
    "Halkalı - Gebze Marmaray Yüzeysel Raylı Sistem Hattı": "https://www.tcddtasimacilik.gov.tr/marmaray/tr/gunluk_tren_saatleri",
    "M1A Yenikapı - Atatürk Havalimanı Metro Hattı": "https://www.metro.istanbul/Hatlarimiz/HatDetay?hat=M1A",
    "M1B Yenikapı - Kirazlı Metro Hattı": "https://www.metro.istanbul/Hatlarimiz/HatDetay?hat=M1B",
    "M2 Yenikapı Seyrantepe - Hacıosman Metro Hattı": "https://www.metro.istanbul/Hatlarimiz/HatDetay?hat=M2",
    "M3 Bakırköy - Kayaşehir Merkez Metro Hattı": "https://www.metro.istanbul/Hatlarimiz/HatDetay?hat=M3",
    "M4 Kadıköy - Sabiha Gökçen Havalimanı Metro Hattı": "https://www.metro.istanbul/Hatlarimiz/HatDetay?hat=M4",
    "M5 Üsküdar - Samandıra Metro Hattı": "https://www.metro.istanbul/Hatlarimiz/HatDetay?hat=M5",
    "M6 Levent - Boğaziçi Ü./Hisarüstü Metro Hattı": "https://www.metro.istanbul/Hatlarimiz/HatDetay?hat=M6",
    "M7 Yıldız - Mahmutbey Metro Hattı": "https://www.metro.istanbul/Hatlarimiz/HatDetay?hat=M7",
    "M8 Bostancı - Parseller Metro Hattı": "https://www.metro.istanbul/Hatlarimiz/HatDetay?hat=M8",
    "M9 Ataköy - Olimpiyat Metro Hattı": "https://www.metro.istanbul/Hatlarimiz/HatDetay?hat=M9",
    "T1 Kabataş - Bağcılar Tramvay Hattı": "https://www.metro.istanbul/Hatlarimiz/HatDetay?hat=T1",
    "T3 Kadıköy - Moda Nostaljik Tramvay Hattı": "https://www.metro.istanbul/Hatlarimiz/HatDetay?hat=T3",
    "T4 Topkapı - Mescid-i Selam Tramvay Hattı": "https://www.metro.istanbul/Hatlarimiz/HatDetay?hat=T4",
    "T5 Eminönü - Alibeyköy Cep Otogarı Tramvay Hattı": "https://www.metro.istanbul/Hatlarimiz/HatDetay?hat=T5",
    "F1 Taksim - Kabataş Füniküler Hattı": "https://www.metro.istanbul/Hatlarimiz/HatDetay?hat=F1",
    "F4 Boğaziçi Üni. / Hisarüstü - Aşiyan Füniküler Hattı": "https://www.metro.istanbul/Hatlarimiz/HatDetay?hat=F4",
    "TF1 Maçka - Taşkışla Teleferik Hattı": "https://www.metro.istanbul/Hatlarimiz/HatDetay?hat=TF1",
    "TF2 Eyüp - Piyer Loti Teleferik Hattı": "https://www.metro.istanbul/Hatlarimiz/HatDetay?hat=TF2"
  };

  istasyonlar = {
    type: "FeatureCollection",
    features: fetchedIstasyon.map((f, i) => ({
      ...f,
      id: f.id || i
    }))
  };

  const hatlar = {
    type: "FeatureCollection",
    features: fetchedHat
  };

  // İstasyon verisini kaynak olarak ekleme
  map.addSource("istasyonlar", {
    type: "geojson",
    data: istasyonlar
  });

  // Hat verisini kaynak olarak ekleme
  map.addSource("hatlar", {
    type: "geojson",
    data: hatlar
  });

  // Hatları gösteren katman
  map.addLayer({
    id: "hatlarLayer",
    type: "line",
    source: "hatlar",
    layout: {
      "line-join": "round",
      "line-cap": "round"
    },
    paint: {
      "line-color": [
        "case",
        ["==", ["get", "PROJE_ASAMA"], "İnşaat Aşamasında"], "#ffc559ff",
        [
          "match",
          ["get", "PROJE_TURU"],
          "Metro", "#002f6c",
          "Hafif Metro", "#4886ddff",
          "Tramvay", "#e30613",
          "Füniküler", "#9900ffff",
          "Banliyö", "#20c7b3ff",
          "Teleferik", "#1cd819ff",
          "Nostaljik Tramvay", "#c720aeff",
          "#5c5c5c5c"
        ]
      ],
      "line-width": 3
    }
  });

  // İstasyonları gösteren katman
  map.addLayer({
    id: "istasyonlarLayer",
    type: "circle",
    source: "istasyonlar",
    layout: {
      "visibility": "none" // İstasyonlar görünmeden başlatılsın
    },
    paint: {
      "circle-radius": [
        "case",
        ["boolean", ["feature-state", "isAranan"], false], 10, 5],
      "circle-color": "#e63946",
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 1
    }
  });

  // Rota Paneli Açma
  document.getElementById("toggleRoutePanel").addEventListener("click", () => {
    const panel = document.getElementById("routePanel");

    const isVisible = panel.classList.contains("show");
    if (isVisible) {
      panel.classList.remove("show");
    } else {
      panel.classList.add("show");
    }
  });

  // Rota oluşturma
  function cizRota(startCoords, endCoords) {
    // Önceki marker'ları ve kaynakları sil
    rotaMarkerlar.forEach(marker => marker.remove());
    rotaMarkerlar = [];

    if (map.getSource("rotaPanel")) {
      map.removeLayer("rotaPanelLayer");
      map.removeSource("rotaPanel");
    }
    if (map.getSource("canliRota")) {
      map.removeLayer("canliRotaLayer");
      map.removeSource("canliRota");
    }
    // Ana rota: başlangıç → bitiş
    const rota = {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [startCoords, endCoords]
      }
    };

    if (map.getSource("rotaPanel")) {
      map.getSource("rotaPanel").setData(rota);
    } else {
      map.addSource("rotaPanel", {
        type: "geojson",
        data: rota
      });

      map.addLayer({
        id: "rotaPanelLayer",
        type: "line",
        source: "rotaPanel",
        paint: {
          "line-color": "#002b99ff",
          "line-width": 4
        }
      });
    }
    // Canlı konumdan başlangıç istasyonuna çizgi
    if (kullaniciKonum) {
      const canliRota = {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [kullaniciKonum, startCoords]
        }
      };

      if (map.getSource("canliRota")) {
        map.getSource("canliRota").setData(canliRota);
      } else {
        map.addSource("canliRota", {
          type: "geojson",
          data: canliRota
        });

        map.addLayer({
          id: "canliRotaLayer",
          type: "line",
          source: "canliRota",
          paint: {
            "line-color": "#ff9900",
            "line-width": 4,
            "line-dasharray": [1, 2]
          }
        });
      }
    }
    // Marker'lar
    rotaMarkerlar.push(
      new maplibregl.Marker({ color: "#1cd819ff" })
        .setLngLat(startCoords)
        .setPopup(new maplibregl.Popup().setText("Başlangıç Noktası"))
        .addTo(map)
    );

    rotaMarkerlar.push(
      new maplibregl.Marker({ color: "#e30613" })
        .setLngLat(endCoords)
        .setPopup(new maplibregl.Popup().setText("Bitiş Noktası"))
        .addTo(map)
    );
  }
  const startSelect = document.getElementById("startSelect");
  const endSelect = document.getElementById("endSelect");

  // dropdown'lara istasyonları doldur
  startSelect.innerHTML = '<option value="">Başlangıç durağı seçin</option>';
  endSelect.innerHTML = '<option value="">Bitiş durağı seçin</option>';

  istasyonlar.features.forEach(f => {
    const opt1 = new Option(f.properties.ISTASYON, f.id);
    const opt2 = new Option(f.properties.ISTASYON, f.id);
    startSelect.add(opt1);
    endSelect.add(opt2);
  });

  if (kullaniciKonum) {
    const enYakin = enYakinIstasyonBul(kullaniciKonum, istasyonlar);
    if (enYakin) {
      startSelect.value = enYakin.id;
    }
  }

  document.getElementById("calculateRouteBtn").addEventListener("click", () => {
    const startID = startSelect.value;
    const endID = endSelect.value;

    if (!startID || !endID) {
      alert("Lütfen başlangıç ve bitiş istasyonlarını seçin.");
      return;
    }

    const startStation = istasyonlar.features.find(f => f.id == startID);
    const endStation = istasyonlar.features.find(f => f.id == endID);

    if (!startStation || !endStation) return alert("İki istasyonu da seçmelisiniz.");

    const startCoords = startStation.geometry.coordinates;
    const endCoords = endStation.geometry.coordinates;

    cizRota(startCoords, endCoords); // mevcut fonksiyonun

    // Butonları göster
    document.getElementById("closeRouteBtn").style.display = "block";
    document.getElementById("goHaritaIstanbulBtn").style.display = "block";

    // Butona tıklanınca yönlendirme yapılsın
    document.getElementById("goHaritaIstanbulBtn").onclick = () => {
      const url = haritaIstanbulURL(startCoords, endCoords);
      window.open(url, "_blank");
    };
  });

  document.getElementById("closeRouteBtn").addEventListener("click", rotaTemizle);

  function haritaIstanbulURL(startCoords, endCoords) {
    return `https://harita.istanbul/2d/route/0126?@=${startCoords[0].toFixed(5)},${startCoords[1].toFixed(5)},13.06718&p=45.00000&b=0.00000&suk=&ruk=${startCoords[0].toFixed(5)},${startCoords[1].toFixed(5)}!${endCoords[0].toFixed(5)},${endCoords[1].toFixed(5)}&ms=!b281!c&o=!o1&w=2!1!2!0&ct=0&duk=&dwk=`;
  }

  function enYakinIstasyonBul(konum, istasyonlar) {
    let minDist = Infinity;
    let yakinIstasyon = null;

    istasyonlar.features.forEach(f => {
      const [lon, lat] = f.geometry.coordinates;
      const dx = konum[0] - lon;
      const dy = konum[1] - lat;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
        minDist = dist;
        yakinIstasyon = f;
      }
    });

    return yakinIstasyon;
  }

  function rotaTemizle() {
    // Marker'ları kaldır
    rotaMarkerlar.forEach(marker => marker.remove());
    rotaMarkerlar = [];

    // Katmanları kaldır
    if (map.getLayer("rotaPanelLayer")) map.removeLayer("rotaPanelLayer");
    if (map.getSource("rotaPanel")) map.removeSource("rotaPanel");

    if (map.getLayer("canliRotaLayer")) map.removeLayer("canliRotaLayer");
    if (map.getSource("canliRota")) map.removeSource("canliRota");

    // Butonları gizle
    document.getElementById("closeRouteBtn").style.display = "none";
    document.getElementById("goHaritaIstanbulBtn").style.display = "none";

    // Dropdown'ları sıfırla
    startSelect.value = "";
    endSelect.value = "";
  }

  // Filtreleme butonuna tıklayınca menüyü aç/kapat
  document.getElementById("toggleMenu").addEventListener("click", () => {
    const controls = document.getElementById("layerControls");
    const toggleRoute = document.getElementById("toggleRoutePanel");
    const routePanel = document.getElementById("routePanel");

    const isOpen = controls.style.display === "block";

    if (isOpen) {
      controls.style.display = "none";
      controls.classList.remove("show");

      toggleRoute.style.top = "55px";
      routePanel.style.setProperty("--route-panel-top", "100px");
    } else {
      controls.style.display = "block";
      setTimeout(() => {
        controls.classList.add("show");
      }, 10);

      toggleRoute.style.top = "170px";
      routePanel.style.setProperty("--route-panel-top", "215px");
    }
  });

  // Hatlar checkbox'ı
  document.getElementById("toggleHatlar").addEventListener("change", (e) => {
    const isChecked = e.target.checked;

    if (isChecked) {
      map.getSource("hatlar").setData(hatlar); // tüm hatları yeniden yükle
      fadeIn("hatlarLayer");
    } else {
      fadeOut("hatlarLayer");
    }
  });

  // İstasyonlar checkbox'ı
  document.getElementById("toggleIstasyonlar").addEventListener("change", (e) => {
    const isChecked = e.target.checked;

    if (isChecked) {
      const currentData = map.getSource("istasyonlar")._data;
      if (!currentData || currentData.features.length === 0) {
        map.getSource("istasyonlar").setData(istasyonlar);
      }
      fadeIn("istasyonlarLayer");
    } else {
      fadeOut("istasyonlarLayer", () => {
        map.getSource("istasyonlar").setData({ type: "FeatureCollection", features: [] });
      });
    }
  });

  // Hat ve İstasyonların animasyonlu şekilde gelmesi
  function fadeIn(layerId, onComplete) {
    map.setLayoutProperty(layerId, "visibility", "visible");
    map.setPaintProperty(layerId, layerId === "hatlarLayer" ? "line-opacity" : "circle-opacity", 0);

    let opacity = 0;
    const duration = 500;
    const startTime = performance.now();

    function animate(currentTime) {
      const t = Math.min((currentTime - startTime) / duration, 1);
      opacity = t;
      map.setPaintProperty(layerId, layerId === "hatlarLayer" ? "line-opacity" : "circle-opacity", opacity);
      if (t < 1) {
        requestAnimationFrame(animate);
      } else if (onComplete) {
        onComplete();
      }
    }
    requestAnimationFrame(animate);
  }

  function fadeOut(layerId, onComplete) {
    let opacity = 1;
    const duration = 500;
    const startTime = performance.now();

    function animate(currentTime) {
      const t = Math.min((currentTime - startTime) / duration, 1);
      opacity = 1 - t;
      map.setPaintProperty(layerId, layerId === "hatlarLayer" ? "line-opacity" : "circle-opacity", opacity);
      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        map.setLayoutProperty(layerId, "visibility", "none");
        if (onComplete) onComplete();
      }
    }
    requestAnimationFrame(animate);
  }

  function showOnlySelectedHat(projeAdi) {
    const normalized = istasyonHatAdi(projeAdi);
    if (aktifHatAdi === normalized) return;

    aktifHatAdi = normalized;

    const filteredHat = {
      type: "FeatureCollection",
      features: hatlar.features.filter(f =>
        istasyonHatAdi(f.properties.PROJE_ADI) === normalized
      )
    };
    const filteredIstasyon = {
      type: "FeatureCollection",
      features: istasyonlar.features.filter(f =>
        istasyonHatAdi(f.properties.PROJE_ADI) === normalized
      )
    };

    // Önce tüm hatları fade out et
    fadeOut("hatlarLayer", () => {
      map.getSource("hatlar").setData(filteredHat);
      fadeIn("hatlarLayer");
    });

    // İstasyonları da göster
    map.getSource("istasyonlar").setData(filteredIstasyon);
    fadeIn("istasyonlarLayer");

    // Checkbox işaretli değilse görünür yap
    document.getElementById("toggleIstasyonlar").checked = true;
    map.setLayoutProperty("istasyonlarLayer", "visibility", "visible");
  }

  // İstasyonların ikonunu büyütme fonksiyonu
  function vurguluIstasyon(yeniID) {
    // Önce tüm istasyonları sıfırla
    istasyonlar.features.forEach(f => {
      map.setFeatureState({ source: "istasyonlar", id: f.id }, { isAranan: false });
    });

    // Yeni istasyona vurgu ekle
    if (yeniID !== null && yeniID !== undefined) {
      map.setFeatureState({ source: "istasyonlar", id: yeniID }, { isAranan: true });
    }
  }

  // Hat popup'ı
  map.on("click", (e) => {
    // Önce istasyona tıklanmış mı kontrol et
    const clickedStation = map.queryRenderedFeatures(e.point, {
      layers: ["istasyonlarLayer"]
    });

    if (clickedStation.length > 0) {// İstasyona tıklanmışsa hat popup'ı açılmasın
      return;
    }

    // Hat tıklanma kontrolü
    const hatlar = map.queryRenderedFeatures(e.point, {
      layers: ["hatlarLayer"]
    });

    if (hatlar.length > 0) {
      const hat = hatlar[0].properties;
      const geometry = hatlar[0].geometry;

      let hatCenter;
      if (geometry.type === "MultiLineString") {
        hatCenter = geometry.coordinates[0][Math.floor(geometry.coordinates[0].length / 2)];
      } else if (geometry.type === "LineString") {
        hatCenter = geometry.coordinates[Math.floor(geometry.coordinates.length / 2)];
      }

      map.flyTo({ center: hatCenter, zoom: 10 });

      const popupHatAdi = istasyonHatAdi(hat.PROJE_ADI);
      new maplibregl.Popup()
        .setLngLat(hatCenter)
        .setHTML(`<strong>Hat Adı:</strong> ${popupHatAdi}<br/><strong>Hat Türü:</strong> ${hat.PROJE_TURU}<br/><strong>Hat Çalışma Aşaması:</strong> ${hat.PROJE_ASAMA}`)
        .addTo(map);

      showOnlySelectedHat(hat.PROJE_ADI);
    }
  });

  // İstasyon popup'ı
  map.on("click", "istasyonlarLayer", (e) => {
    const p = e.features[0].properties;
    const hatAdi = p.PROJE_ADI || "-";
    const normalizedHatAdi = istasyonHatAdi(hatAdi);
    const seferLink = hatLinkleri[normalizedHatAdi];
    document.getElementById("station-name").textContent = p.ISTASYON || "Bilinmiyor";
    document.getElementById("station-description").innerHTML = `
      <strong>Hat Adı:</strong> ${normalizedHatAdi}<br/>
      <strong>Hat Türü:</strong> ${p.HAT_TURU || "-"}<br/><br/>
      ${seferLink
        ? `<a href="${seferLink}" target="_blank" style="display:inline-block;margin-top:8px;">Sefer saatleri için tıklayınız</a>`
        : `<span style="color:gray;">Sefer saati bilgisi bulunamadı</span>`
      } `;
    const panel = document.getElementById("info-panel");
    panel.classList.add("visible");

    const legend = document.getElementById("legendBox");
    const infoPanelHeight = panel.getBoundingClientRect().height;
    legend.style.transform = `translateY(-${infoPanelHeight + 10}px)`;

    const clickedId = e.features[0].id;
    showOnlySelectedHat(p.PROJE_ADI);
    setTimeout(() => {
      vurguluIstasyon(clickedId);
    }, 10);
  });

  // Harita boşluğuna tıklayınca reset işlemi
  map.on("click", (e) => {
    const controls = document.getElementById("layerControls");
    const clickedElement = e.originalEvent.target;

    // Eğer DOM'da harita dışındaki bir şeye tıklanmışsa (örneğin buton, panel), hiçbir şey yapma
    if (
      clickedElement.closest("#toggleMenu") ||
      clickedElement.closest("#layerControls") ||
      clickedElement.closest("#routePanel") ||
      clickedElement.closest("#toggleRoutePanel") ||
      clickedElement.closest("#info-panel") ||
      clickedElement.closest("#searchContainer")
    ) {
      return;
    }

    const features = map.queryRenderedFeatures(e.point, {
      layers: ["hatlarLayer", "istasyonlarLayer"]
    });

    // Tıklanan yer haritadaki bir istasyon veya hatta denk gelirse, menüyü kapatma
    if (features.length > 0) return;

    // Sadece boşluğa tıklanmışsa menüyü kapat
    controls.style.display = "none";
    controls.classList.remove("show");

    // Route panel pozisyonunu resetle
    document.getElementById("toggleRoutePanel").style.top = "55px";
    document.getElementById("routePanel").style.setProperty("--route-panel-top", "100px");

    // Eğer bir hat seçiliyse resetle
    if (aktifHatAdi) {
      aktifHatAdi = null;
      document.getElementById("info-panel")?.classList.remove("visible");
      document.getElementById("legendBox").style.transform = "translateY(0)";
      document.getElementById("toggleIstasyonlar").checked = false;

      fadeOut("istasyonlarLayer", () => {
        map.getSource("istasyonlar").setData({ type: "FeatureCollection", features: [] });
      });

      fadeOut("hatlarLayer", () => {
        map.getSource("hatlar").setData(hatlar);
        fadeIn("hatlarLayer");
      });

      vurguluIstasyon(null);
    }
  });

  // Otomatik tamamlama verileri: Normalize edilmiş hat adları
  const allNames = [
    ...new Set(
      hatlar.features
        .filter(f => f.properties.PROJE_ASAMA !== "İnşaat Aşamasında")
        .map(f => istasyonHatAdi(f.properties.PROJE_ADI))
        .filter(Boolean)
    )
  ].sort((a, b) => a.localeCompare(b, 'tr', { sensitivity: 'base' }
  ));

  // Datalist oluştur
  const datalist = document.createElement("datalist");
  datalist.id = "suggestions";
  allNames.forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    datalist.appendChild(option);
  });
  searchInput.setAttribute("list", "suggestions");
  document.body.appendChild(datalist);

  // Arama butonu kullanınca çalışacak sistem
  document.getElementById("searchBtn").addEventListener("click", () => {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) return;

    // Önce istasyon adı eşleşmesi kontrol edilir
    const matchedIstasyon = istasyonlar.features.find(f =>
      (f.properties.ISTASYON || "").toLowerCase().includes(query)
    );

    if (matchedIstasyon) {
      const coords = matchedIstasyon.geometry.coordinates;
      const p = matchedIstasyon.properties;
      map.flyTo({ center: coords, zoom: 14 });

      const hatAdi = p.PROJE_ADI || "-";
      const normalizedHatAdi = istasyonHatAdi(hatAdi);
      const seferLink = hatLinkleri[normalizedHatAdi];
      document.getElementById("station-name").textContent = p.ISTASYON || "Bilinmiyor";
      document.getElementById("station-description").innerHTML = `
      <strong>Hat Adı:</strong> ${normalizedHatAdi}<br/>
      <strong>Hat Türü:</strong> ${p.HAT_TURU || "-"}<br/><br/>
      ${seferLink
          ? `<a href="${seferLink}" target="_blank" style="display:inline-block;margin-top:8px;">Sefer saatleri için tıklayınız</a>`
          : `<span style="color:gray;">Sefer saati bilgisi bulunamadı</span>`
        } `;
      const panel = document.getElementById("info-panel");
      panel.classList.add("visible");

      const legend = document.getElementById("legendBox");
      const infoPanelHeight = panel.getBoundingClientRect().height;
      legend.style.transform = `translateY(-${infoPanelHeight + 10}px)`;

      showOnlySelectedHat(normalizedHatAdi);
      vurguluIstasyon(matchedIstasyon.id);
      return;
    }

    // Ardından normalize hat adı ile eşleşme kontrol edilir
    const matchedHat = hatlar.features.find(f =>
      istasyonHatAdi(f.properties.PROJE_ADI || "").toLowerCase().includes(query)
    );

    if (matchedHat) {
      const coordinates = matchedHat.geometry.coordinates;
      let hatCenter;

      if (matchedHat.geometry.type === "MultiLineString") {
        const allCoords = coordinates.flat(1);
        hatCenter = allCoords[Math.floor(allCoords.length / 2)];
      } else if (matchedHat.geometry.type === "LineString") {
        hatCenter = coordinates[Math.floor(coordinates.length / 2)];
      }

      if (!hatCenter) {
        alert("Hat merkezi belirlenemedi.");
        return;
      }

      const p = matchedHat.properties;
      const normalizedHatAdi = istasyonHatAdi(p.PROJE_ADI);

      map.flyTo({ center: hatCenter, zoom: 12 });

      new maplibregl.Popup()
        .setLngLat(hatCenter)
        .setHTML(`<strong>Hat Adı:</strong> ${normalizedHatAdi}<br/><strong>Hat Türü:</strong> ${p.PROJE_TURU}<br/><strong>Hat Proje Aşaması:</strong> ${p.PROJE_ASAMA}`)
        .addTo(map);
      showOnlySelectedHat(normalizedHatAdi);
      return;
    }
    alert("Sonuç bulunamadı.");
  });

  // Fare ile etkileşim
  map.on("mouseenter", "istasyonlarLayer", () => map.getCanvas().style.cursor = "pointer");
  map.on("mouseleave", "istasyonlarLayer", () => map.getCanvas().style.cursor = "");
  map.on("mouseenter", "hatlarLayer", () => map.getCanvas().style.cursor = "pointer");
  map.on("mouseleave", "hatlarLayer", () => map.getCanvas().style.cursor = "");
});