# Prérequis :

### Docker up & running

# Commandes :

## Depuis le folder parent (avec le .env)

```console
docker run --env-file .env --name payload-postgres -p 5432:5432 -v payload-data:/var/lib/postgresql/data -d postgres:16-alpine
```

> ## .env :
> 
> POSTGRES_PASSWORD=superpassword

## Depuis le folder payload (avec le .env)

```console
pnpm i && pnpm dev
```

```console
# docker
# DATABASE_URI=postgres://postgres:superpassword@payload-postgres:5432/payload-purple-dog

# normal
DATABASE_URI=postgres://postgres:superpassword@localhost:5432/payload-purple-dog


PAYLOAD_SECRET=7471ea6bde69aa878ccadfc1
# Added by Payload
```
