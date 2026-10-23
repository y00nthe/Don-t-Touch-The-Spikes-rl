# Don-t-Touch-The-Spikes-rl
Agent uczenia ze wzmocnieniem uczący się grać w grę 2D bazowanej na "Don’t Touch the Spikes". Projekt z przedmiotu Uczenie się ze wzmocnieniem.

Gra to klon *Don't Touch The Spikes* napisany w TypeScript + Canvas (Vite), port z wersji C++/SFML.

## Uruchomienie

```bash
npm install
npm run dev
npm test
npm run build
```

## Sterowanie

- **Klik** – wybór poziomu w menu (Easy, Medium, Hard, Expert)
- **Spacja** – skok / restart po przegranej
- **Esc** – powrót do menu

## Uwagi pod RL

- Logika gry zawsze działa w stałych współrzędnych 400×600 – rozmiar okna zmienia tylko skalę rysowania.
- Agent ma dwie akcje: spacja albo nic.
