# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Visão geral

Frontend Angular 21 (standalone, sem NgModules) para gestão de animais de uma ONG. Consome uma API Spring Boot via HTTP. Toda a UI usa Angular Material e o app está em Português Brasil (locale `pt-BR`).

## Comandos

```bash
npm start            # ng serve — dev server em http://localhost:4200
npm run build        # ng build — saída em dist/ (configuração production por padrão)
npm run watch        # build incremental em modo development
npm test             # ng test — executa os specs com Vitest
npx vitest run src/app/app.spec.ts   # roda um único arquivo de teste
```

O runner de teste é **Vitest** (não Karma/Jasmine), integrado via `@angular/build:unit-test` no `angular.json`. Os arquivos usam a API estilo Jasmine (`describe`/`it`/`expect`) que o Vitest expõe.

## Backend / configuração

- A URL da API fica em `src/environments/environment.ts` (`apiUrl`, padrão `http://localhost:8080`). É o único ponto de configuração do backend.
- Não há proxy nem interceptors HTTP; cada service monta sua própria URL a partir de `environment.apiUrl`.
- Erro de conexão (`status === 0`) é tratado como "backend não está rodando" em `mensagemDeErro`.

## Arquitetura

Fluxo de dados de cada tela: **componente standalone → service (`inject(HttpClient)`) → API**. Não há state management global; o estado vive em `signal()`s dentro de cada componente.

- `src/app/app.config.ts` — providers raiz: router, `provideHttpClient()`, date adapter nativo e `MAT_DATE_LOCALE: 'pt-BR'`.
- `src/app/app.routes.ts` — rotas com `loadComponent` (lazy). O form de criar e editar reusa o mesmo componente `AnimalForm`; a presença do param `:id` distingue os modos.
- `src/app/features/animais/` — telas: `animal-list` (tabela Material + diálogo de exclusão), `animal-form` (criar/editar), `animal-delete-dialog` (confirmação inline).
- `src/app/services/` — wrappers HTTP por recurso (`AnimalService`, `RacaService`).
- `src/app/models/` — interfaces que **espelham o backend**; ver convenções abaixo.
- `src/app/shared/erro.ts` — `mensagemDeErro(err)` traduz `HttpErrorResponse` para texto exibível, lendo o padrão `ProblemDetail` (RFC 7807) da API.

### Convenções importantes (espelham o contrato do backend)

- **Enums** (`models/enums.ts`): valores trafegam em MAIÚSCULAS (`DISPONIVEL`, `MACHO`, `PEQUENO`). Cada enum tem uma lista `Opcao<T>[]` para `<mat-select>` e um `*_LABELS` (Record) para exibição. Sempre adicione novos valores nos dois lugares.
- **Relações** (`Animal.raca`, `Animal.adotante`): nas respostas de leitura vêm como objetos completos; ao enviar (POST/PUT) manda-se apenas `{ id }`. O `AnimalForm.salvar()` faz essa conversão.
- **Datas**: a API usa string ISO `yyyy-MM-dd`. `AnimalForm` converte para/de `Date` com `paraIso`/`paraData`, construindo no fuso local (`T00:00:00`) para não deslocar o dia.
- **Regra de validação condicional**: `adotante` é obrigatório apenas quando `status === 'ADOTADO'` — implementado via `valueChanges` no form, espelhando a regra do backend.

### Padrões de componente

- Standalone com `imports: [...]` explícito (sem `declarations`); injeção via `inject()`, não construtor.
- Estado reativo com `signal()` / `computed()`; assinaturas RxJS limpas com `takeUntilDestroyed()`.
- Feedback ao usuário via `MatSnackBar` (sempre rótulo "Fechar", `duration: 5000`); confirmações destrutivas via `MatDialog`.
- Estilos em SCSS por componente (`inlineStyleLanguage: scss`, schematic padrão `style: scss`).
- Formatação por Prettier (`.prettierrc`).

## Backend (Spring Boot)

A API consumida vive em **repositório separado**: `C:\Users\acorreia3\Downloads\sistema-ong-animal\sistema-ong-animal` (tem seu próprio `CLAUDE.md` mais detalhado). Stack: **Spring Boot 3.5 / Java 17 / PostgreSQL / Flyway**, pacote `com.umc.sistemaonganimal`.

O que importa para o frontend:

- **Sem DTOs**: os controllers usam as **entidades JPA diretamente** como request/response. Por isso os modelos em `src/app/models/` espelham 1:1 as entidades do backend — ao mudar uma entidade ou enum lá, atualize o modelo aqui (e vice-versa).
- **Associações** (`raca`, `adotante`, `especie`): o backend valida apenas o `id` da entidade aninhada (via grupos de validação), então enviar `{ id }` basta no POST/PUT — exatamente o que `AnimalForm.salvar()` faz.
- **Erros** seguem RFC 7807 `ProblemDetail`; validações retornam um mapa `detalhes` campo→mensagem, lido em `src/app/shared/erro.ts`.
- **Regra de adotante**: o `AnimalService` do backend só exige/resolve o `Adotante` quando `status == ADOTADO`. O form espelha isso tornando `adotanteId` obrigatório só nesse status.
- **CORS**: o backend libera `http://localhost:4200` em dev (`CorsConfig`). Se mudar a porta do `ng serve`, ajuste lá também.
- Rodar o backend: a partir do diretório do `pom.xml`, `mvnw.cmd spring-boot:run` (porta 8080). Requer um `application-local.properties` com credenciais PostgreSQL (não versionado).

Apenas o **CRUD de Animais** está implementado nos dois lados como padrão de referência; Adotante, Espécie e Raça devem replicá-lo.

## Notas

- `app.spec.ts` ainda contém o teste boilerplate do Angular CLI (procura "Hello, sistema-ong-animal-frontend") — não reflete a UI atual; ajuste ao mexer em `App`.
