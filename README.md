# KULTNYT // Alternativ Musik, Udgivelser & DK-Turnéer

Kultnyt er et lynhurtigt, kurateret musikdashboard og nyhedssite dedikeret til alternativ musik, nye udgivelser og turnédatoer med særligt fokus på koncerter i Danmark.

Systemet er inspireret af arkitekturen fra **AIopdatering**, men bygget med en integreret **Next.js + Tailwind CSS** frontend og en lokal **Python + Ollama AI** pipeline på din headless Mac Mini.

---

## ⚡ Funktioner & Indhold

1. **Nyhedsfeed med Fyldige Danske AI-Resuméer**:
   - Høster automatisk fra førende alternative kilder: *Stereogum, The Quietus, BrooklynVegan, Pitchfork (Best New Music & News), Bandcamp Daily, GAFFA og Soundvenue*.
   - Lokal AI (**Llama 3.2 via Ollama**) genererer 2-3 skarpe, fængende sætninger på dansk for hver artikel med fokus på musikkens lyd og stemning.
   - Bevarer originale overskrifter og direkte links til kildeartiklerne.
   - Indbygget gem/bogmærke-funktion i browseren.

2. **Release Radar (Nye & Kommende Udgivelser)**:
   - Automatisk udtræk af nye albums, EP'er og singler.
   - Viser format (LP, EP, Single), kunstner, udgivelsestitel og genrer.
   - Direkte søgelinks til **Bandcamp** og **Spotify** med ét klik.

3. **Koncertradar Danmark**:
   - Automatisk detektion af turnéer og koncerter i Danmark (København, Aarhus, Odense, Aalborg m.fl.).
   - Filtrering efter by og spillested (*VEGA, Pumpehuset, Loppen, VoxHall, Radar, Roskilde Festival osv.*).

4. **Live Ticker & Genrefiltrering**:
   - Rullende live-radar i toppen med de seneste overskrifter.
   - Hurtig klientside-søgning og klikbare subgenre-piller (*Post-punk, Shoegaze, Indie Rock, Electronic, Ambient, Experimental, Alt-folk, Metal*).

---

## 🚀 Hurtig Start (Lokal Udvikling)

```bash
# 1. Gå til mappen
cd "/Users/familie/Desktop/ Kultnyt"

# 2. Start dashboardet
npm run dev
```

Åbn derefter [http://localhost:3000](http://localhost:3000) i din browser.

---

## 🎵 Sådan Høster Du Nye Data

Du kan opdatere data på tre måder:

### Metode 1: Direkte fra Webinterfacet
Klik på knappen **"Høst nu"** øverst i højre hjørne på dashboardet. Next.js kalder automatisk baggrunds-pipelinen og opdaterer dataene i realtid.

### Metode 2: Fra Terminalen (med lokal Ollama AI)
```bash
npm run harvest
# eller med argumenter:
python3 scripts/harvest.py --limit 5
```

### Metode 3: Hurtig-høst (uden AI)
```bash
npm run harvest:fast
```

---

## 🤖 Headless Mac Mini Automatisering (24/7 Server)

Da din Mac Mini fungerer som en altid-tændt server, kan du automatisere høstningen helt uden manuel indgriben:

### 1. Kør via Cronjob (Hver 6. time)
Åbn crontab på din Mac Mini:
```bash
crontab -e
```
Tilføj følgende linje (kører kl. 06:00, 12:00, 18:00 og 00:00):
```bash
0 6,12,18,0 * * * cd "/Users/familie/Desktop/ Kultnyt" && export PATH="$HOME/.local/bin:$PATH" && /usr/bin/python3 scripts/harvest.py --limit 5 >> harvest.log 2>&1
```

---

## 🌐 Udrulning til GitHub & Vercel

Sitet er forberedt til automatisk deployment på Vercel, mens din Mac Mini fortsat klarer AI-høsten:

1. Opret et nyt repository på GitHub (f.eks. `kultnyt`).
2. Kobl dit lokale projekt til GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Kultnyt"
   git remote add origin https://github.com/<dit-brugernavn>/kultnyt.git
   git push -u origin main
   ```
3. Opret projektet på **Vercel** og importer dit GitHub-repo. Vercel bygger og hoster sitet kvit og frit.
4. Kør fremtidige høstninger med `--git-push` flaget:
   ```bash
   python3 scripts/harvest.py --git-push
   ```
   Dette committer automatisk de nye data i `data/` og pusher til GitHub, hvorefter Vercel opdaterer websitet på under 30 sekunder!
