# SODAX EURC Bridge — Base ↔ Stellar

A read-only diagnostic project to investigate whether EURC can be bridged between Base and Stellar through SODAX.

## Current stage

Stage 1: inspect the installed SODAX SDK configuration and discover the exact EURC token metadata and supported bridge methods before making any route assumptions.

## Safety rules

- Read-only diagnostics only.
- No wallet connection.
- No private keys, seed phrases, or wallet secrets.
- No token approvals, signatures, or transaction submissions.
- Never claim a route is supported until both directions pass the SDK bridge compatibility checks and capacity reads.
- A zero partner fee does not establish zero total cost; protocol fees, conversion spreads, Base gas, and Stellar network fees must be checked separately.

## Run in StackBlitz

1. Open the StackBlitz project.
2. Open the terminal.
3. Run `npm install`.
4. Run `npm run inspect:sdk`.
5. Share the complete terminal output so the next step can use the exact SDK token metadata rather than guessed Stellar address formats.

The project uses the stable `@sodax/sdk` release. Review SDK changes before upgrading.

## Private environment files

The repository ignores `.env` and other `.env.*` files. Only `.env.example` is intended to be committed. Do not add secrets to `.env.example` or paste secrets into chat.
