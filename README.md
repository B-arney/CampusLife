# Campus Life

## Első indítás

Első indításnál mindenkép szükséges használna a scriptet, ezzel hozzuk létre a futtatáshoz szükséges fájlokat

```bash
./run.sh
```

## Az app futtatása

```bash
docker compose up -d
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

Ha nem szeretnéd a backend-et dockerben használni, erre is van lehetőség.
A generált .env másolni kell a backend-be

```bash
cp .env apps/backend/.env
```

Ahhoz, hogy tudjad is használni a parancsokat hozzá, ahhoz át kell írni a .env-ben a **POSTGRES_HOST** változó értékét **localhost**-ra, ezután az apps/backend/README.md-ben írtak alapján működni fog