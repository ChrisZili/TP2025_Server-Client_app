# Retinálny obrazový systém

Tento projekt je navrhnutý na ukladanie, správu a spracovanie obrazov očných sietnic. Na serverovej strane sa spracovávajú dáta a uchovávajú sa v MySQL databáze, zatiaľ čo klientská časť (webové rozhranie) umožňuje prístup k databáze, spúšťanie spracovateľských algoritmov a prezeranie výsledkov.

## Cieľ projektu

Cieľom aplikácie je:
- Ukladať a spravovať obrazy očných sietnic a s nimi spojené údaje.
- Umožniť spúšťanie preddefinovaných algoritmov (klasifikácia, segmentácia a detekcia) na vybraný obraz.
- Poskytnúť prehľadné webové rozhranie pre správu databázy a prístup z mobilných zariadení pomocou PWA (Progressive Web Apps).

## Funkcionality

1. **Server aplikácia s MySQL databázou**  
   - Ukladanie informácií o používateľoch (s rôznymi úrovňami prístupu).  
   - Uchovávanie anonymizovaných údajov o pacientoch.  
   - Evidovanie ciest k súborom obsahujúcim obrazy očných sietnic.

2. **Web rozhranie pre správu databázy**  
   - Prehľadné zobrazenie obrazov a výsledkov spracovania podľa jednotlivých používateľov.  
   - Administratívne nástroje pre správu a údržbu databázy.

3. **Web formulár pre mobilné zariadenia (PWA)**  
   - Responzívny prístup cez progresívnu webovú aplikáciu optimalizovanú pre mobilné zariadenia.
   

4. **Testovanie funkcionalít**  
   - Jednotkové a integračné testy na overenie funkčnosti celej aplikácie.  
   - Zabezpečenie kvality a spoľahlivosti implementovaných riešení.

## Technológie

- **Backend:** Flask (Python) s PostgreSQL databázou
- **Frontend:** HTML, CSS, JavaScript
- **Algoritmy:** Preddefinované algoritmy pre klasifikáciu, segmentáciu a detekciu obrazov

