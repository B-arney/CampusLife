if [ ! -f ".env" ]; then
    cp sample.env .env
    echo ".env létrehozva a sample.env alapján."
else
    echo ".env már létezik, nem másoltuk."
fi

PG_PASSWORD="POSTGRES_PASSWORD"
if grep -q "^$PG_PASSWORD=[^[:space:]]" .env 2>/dev/null; then
    echo "$PG_PASSWORD már rendelkezik értékkel, nem módosítottuk."
else
    PASSWORD=$(tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 24)
    if grep -q "^$PG_PASSWORD=" .env 2>/dev/null; then
        sed -i "s/^$PG_PASSWORD=.*/$PG_PASSWORD=$PASSWORD/" .env
    else
        echo "$PG_PASSWORD=$PASSWORD" >> .env
    fi
    echo "$PG_PASSWORD jelszó létrehozva: $PASSWORD"
fi

PG_USER="POSTGRES_USER"
if grep -q "^$PG_USER=[^[:space:]]" .env 2>/dev/null; then
    echo "$PG_USER már rendelkezik értékkel, nem módosítottuk."
else
    USER=$(tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 16)
    if grep -q "^$PG_USER=" .env 2>/dev/null; then
        sed -i "s/^$PG_USER=.*/$PG_USER=$USER/" .env
    else
        echo "$PG_USER=$USER" >> .env
    fi
    echo "$PG_USER felhasználó létrehozva: $USER"
fi

docker compose up --build