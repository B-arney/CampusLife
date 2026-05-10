# Campus Life

## Első indítás

Első indításnál mindenkép szükséges használna a scriptet, ezzel hozzuk létre a futtatáshoz szükséges fájlokat

```bash
./run.sh
```

## Az app futtatása

```bash
# buildelt konténerek futtatása logok nélkül
docker compose up -d
# konténerek leállítása
docker compose down
# logok adott konténerhez (csak futó konténerre működik)
docker compose logs -f <KONTÉNER_NEVE>
```

Ha szeretnéd a logokat látni, akkor lehagyható a -d kapcsoló
Ha már futnak a konténerek

```bash
docker compose attach kontener_nev
```

vagy az összes konténerhez csatlakozás

```bash
docker compose up
```

Kilépés anélkül, hogy leállítanánk a konténereket

```
ctrl+z
```

Kilépés konténer leállítással

```
ctrl+c
```

## Környezeti változók

Az első futtatáskor a `./run.sh` legenerálja a `.env` fájlt. Ebben az alábbiakat kell manuálisan beállítani az email küldéshez és az értesítésekhez:
- `SMTP_USER`: Brevo (vagy egyéb) SMTP felhasználónév
- `SMTP_PASS`: SMTP jelszó/kulcs
- `BASE_URL`: Az alkalmazás elérhetősége (pl. `https://campuslife.social`)
- `VAPID_PUBLIC_KEY`: Web-push értesítésekhez szükséges publikus kulcs.
- `VAPID_PRIVATE_KEY`: Web-push értesítésekhez szükséges privát kulcs.

**Web-push VAPID kulcsok generálása:**
A csapattagok helyi fejlesztéshez és a szerverre is külön kulcspárt generálhatnak a backend mappájában (vagy a szerveren a futó backend konténerben) lévő paranccsal:
```bash
npx web-push generate-vapid-keys
```
A parancs kimenetét be kell másolni a `.env` fájl megfelelő változóihoz, majd újra kell indítani a backend konténert (`docker compose restart backend`). Éles környezetben (production) kérjük, kifejezetten új kulcsot generálj és soha ne tedd be git-be!

## SSL Tanúsítványok

A rendszer HTTPS-t használ a 443-as porton. A tanúsítványokat a `docker/ssl/` mappába kell helyezni az alábbi nevekkel:
- `fullchain.pem`
- `privkey.pem`

Biztonsági okokból ezek a fájlok nem kerülnek be a git repóba.

## Az app futtatása
```bash
docker compose up -d
```
Az alkalmazás a standard HTTP (80) és HTTPS (443) portokon érhető el.