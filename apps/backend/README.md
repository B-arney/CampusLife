# Backend

## Dev környezet

A fejlesztői környezet indításával csak a **backend** indul el. A szükséges környezeti változók azonban nem lesznek automatikusan elérhetők, ezért a **docker szinten található `.env` fájlt** ide is másolni kell.

A backend base endpointja:

```
http://localhost:3000/api/
```

Példa:

```
http://localhost:3000/api/health
```

Indítás:

```bash
npm run dev
```

---

## Függőségek telepítése

Első indítás előtt telepíteni kell a függőségeket (ezt alapesetben a run.sh is elvégzi):

```bash
npm install
```

---

## Prisma Schema

Az adatbázis modellek a következő fájlban találhatók:

```
prisma/schema.prisma
```

A modellek módosítása után az adatbázist szinkronizálni kell.

---

# Adatbázis kezelés Prisma-val

## Model szinkronizálás (`db push`)

A `schema.prisma` fájlban definiált modellek alapján frissíti az adatbázist.

Ez **nem hoz létre migration fájlokat**, csak közvetlenül módosítja az adatbázist.

```bash
npx prisma db push
```

Ez általában **gyors fejlesztési környezetben** ajánlott.

---

## Migration létrehozása

Ha szeretnél **verziózott adatbázis migrationöket**, akkor használd a következő parancsot:

```bash
npx prisma migrate dev --name valami_leiras
```

Ez a parancs:

1. létrehozza a migration fájlt
2. lefuttatja azt az adatbázison
3. frissíti a Prisma Client-et

---

## Prisma Client generálása

A Prisma Client generálása a `schema.prisma` alapján történik.
Ez szükséges ahhoz, hogy a modelleket a kódban használni lehessen.

A parancsot akkor kell futtatni, ha a schema megváltozott.

```bash
npx prisma generate
```

---

## Prisma Studio (adatbázis GUI)

Az adatbázis böngészésére és szerkesztésére használható webes felület.
**Ez csak akkor használható, hogy ha backend nem dockerben fut és ha POSTGRES_HOST értéke localhost, különben nem tud csatlakozni**

```bash
npx prisma studio
```

---

## Seed adatok (opcionális)

Ha seed script van definiálva a projektben, akkor az alábbi paranccsal lehet alap adatokat betölteni az adatbázisba:

```bash
npx prisma db seed
```