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

Az első futtatáskor a `./run.sh` legenerálja a `.env` fájlt. Ebben az alábbiakat kell manuálisan beállítani az email küldéshez:
- `SMTP_USER`: Brevo (vagy egyéb) SMTP felhasználónév
- `SMTP_PASS`: SMTP jelszó/kulcs
- `BASE_URL`: Az alkalmazás elérhetősége (pl. `https://campuslife.social`)

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