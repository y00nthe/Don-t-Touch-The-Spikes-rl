# Don't Touch The Spikes – RL

Agent uczenia ze wzmocnieniem uczący się grać w grę 2D wzorowaną na „Don’t Touch the Spikes”. Projekt z przedmiotu Uczenie się ze wzmocnieniem.

## Zasady gry

- Ptak leci w poziomie ze stałą prędkością i odbija się od lewej i prawej ściany.
- Każde odbicie od ściany to 1 punkt.
- Po odbiciu na ścianie, do której leci ptak, pojawiają się kolce w losowych miejscach.
- Sufit i podłoga są pokryte kolcami. Dotknięcie dowolnego kolca kończy grę.
- Co 5 punktów kolców jest więcej, ale zawsze zostają co najmniej 4 wolne miejsca.
- Monety zwiększają licznik monet i nie wpływają na rozgrywkę.

| Poziom | Prędkość [px/s] | Kolce na starcie |
|--------|-----------------|------------------|
| Easy   | 150             | 2                |
| Medium | 200             | 3                |
| Hard   | 250             | 4                |
| Expert | 300             | 5                |

## Sterowanie

- **Klik** – wybór poziomu w menu
- **Spacja** – skok, a po przegranej restart
- **Esc** – powrót do menu

## Wymagania

- [Node.js](https://nodejs.org/) w wersji 20 lub nowszej

## Uruchomienie

```bash
npm install
npm run dev
```

## Struktura repozytorium

```
src/          kod gry
tests/        testy logiki gry
experiments/  skrypty eksperymentów RL
results/      wyniki, wykresy i logi z uczenia
report/       raport projektowy (LaTeX + PDF)
public/       zasoby gry (grafika monety)
```
