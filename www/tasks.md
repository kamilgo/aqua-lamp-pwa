# Taski

## WWW
[X] zmergować zmiany z wygenerowanej htmlki w PWA

[X] przerobic na polskie napisy

[X] przesyłać dni tygodnia w formie liczb a nie nazw

[X] dodać opcje obecny czas zamiast wysyłać wypełnione pole z czasem

[X] dodac `version` do `Configuration` jako timestamp

[X] Przesyłać czas do synchronizacji po modyfikacji z lokalną strefą czasową

[X] Sterowanie pojedynczym kanałem

[X] Usunąć block z labela i width: 100% z pól dla lepszej widoczności

[X] Krzyzyk do usuwania komunikatu

[] Przesyłać prawidłowe numery kanałów albo obsłuzyc po stronie pico (kanały liczymy od zera!)

[X] Testowanie łączności poprzez wysłanie pinga

## Pico

[X] Wyodrębnić WebServer

[X] Zapisywac time zone offset w pliku i z niego korzystać przy aktualizacji czasu

[] Resetowanie wszystkich ustawień

[X] Wysyłanie pong na pinga

[X] Webserver musi byc po https zeby obsluzyl z domeny.

[] Zapisywanie WiFi

[X] Sterowanie pojedynczym kanałem
  [X] ON/OFF sterowanie ręczne (usuń kanał ze sterowania auto)
  [Xtem] Zmiana PWMa kanału


  * Spróbować ze strony akwalampy.gokam.pl sterować bez https
   - działa tylko w przeglądarce na telefonie ale w FF, nie w chromie
  * Dodać zapisywanie WiFi

## Funkcjonalności do rozważenia (2025-12-16)

### Usprawnienia UX:
[] **Dashboard view** - podsumowanie statusu wszystkich kanałów
[] **Timeline preview** - wizualizacja harmonogramów na wykresie 24h
[] **Quick presets** - gotowe szablony harmonogramów (świt, zmierzch, pełne słońce)
[] **Dark mode** - przełącznik trybu ciemnego
[] **Notifications** - powiadomienia o zmianach stanu

### Funkcjonalności techniczne:
[] **Auto-reconnect** - automatyczne ponowne łączenie przy utracie połączenia
[] **Stats & logs** - historia zmian PWM, uptime urządzenia
[] **Password protection** - opcjonalne hasło do panelu
[] **Cloud backup** - opcjonalny backup konfiguracji do localStorage/cloud
[] **PWA install prompt** - zachęta do instalacji jako aplikacja

### Refaktoryzacja:
[] Migracja z vanilla JS na **Alpine.js** + **Tailwind CSS**
[] Podział na 3 zakładki: Sterowanie / Harmonogramy / Ustawienia
[] Wydzielenie logiki do osobnych modułów JS (app.js, api.js, storage.js, translations.js)

 Następne kroki po modularyzacji:

  1. Dodać nowe funkcje - każda w odpowiednim module
  2. Napisać testy jednostkowe - moduły są gotowe do testowania
  3. Zoptymalizować - użyć bundlera (Vite, Rollup) w przyszłości
  4. Rozszerzyć API - dodać nowe endpointy w api.js