# Politique de sécurité

## Signaler une vulnérabilité

Ne publiez pas de vulnérabilité, de secret ou de donnée sensible dans une issue publique.

Utilisez le canal privé de signalement de vulnérabilités du dépôt GitHub. Si ce canal n’est pas disponible, contactez le propriétaire du dépôt par un canal privé préalablement vérifié.

Le signalement doit contenir uniquement les informations nécessaires à la reproduction. Les identifiants, données personnelles et secrets de production doivent être remplacés par des valeurs fictives.

## Règles du dépôt

- Aucun secret ne doit être stocké dans Git.
- Les exemples de configuration utilisent exclusivement des valeurs fictives.
- Les dépendances et GitHub Actions sont soumises à revue.
- Une vulnérabilité critique bloque toute publication.
- Une vulnérabilité élevée bloque le merge sauf acceptation de risque explicitement documentée et approuvée.
- Toute correction de sécurité doit rester traçable et réversible.
- Aucun agent IA ne doit supprimer un test, désactiver une règle de sécurité, ignorer un finding critique/élevé ou affaiblir une protection uniquement pour faire passer la CI.
- Les secrets réels sont fournis par le gestionnaire de secrets ou GitHub Actions Secrets et ne sont jamais écrits dans le dépôt.

## Chaîne de sécurité obligatoire

### Pendant le développement

1. GitGuardian : détection de secrets et identifiants exposés.
2. Snyk : dépendances, vulnérabilités et composants tiers.
3. Semgrep : analyse statique du code et règles OWASP/TypeScript.
4. Tests du dépôt : qualité, tests unitaires, intégration, migrations et tests de politiques d’accès.

### Avant merge et déploiement

5. `/ultrareview` lorsqu’il est disponible dans l’environnement Codex/revue utilisé par l’équipe. Cette revue complète les scanners mais ne les remplace pas.
6. Build complet du projet.
7. Snyk, Semgrep et audit des dépendances doivent être verts, sous réserve des règles d’acceptation de risque approuvées.
8. Vérifier explicitement authentification, autorisation, RBAC, isolation multi-tenant, idempotence et flux financiers concernés par le changement.

### Staging / après déploiement

9. OWASP ZAP est lancé contre l’environnement de staging ou un environnement autorisé. Les scans actifs agressifs ne doivent pas être lancés sur la production sans procédure approuvée.

## Outils CI

Le workflow `.github/workflows/security.yml` exécute :

- Semgrep sur push et pull request ;
- audit des dépendances sur push et pull request ;
- GitGuardian lorsque `GITGUARDIAN_API_KEY` est configuré ;
- Snyk lorsque `SNYK_TOKEN` est configuré ;
- OWASP ZAP sur déclenchement manuel contre `STAGING_BASE_URL`.

Variables/secrets à configurer manuellement dans GitHub :

- secret `GITGUARDIAN_API_KEY` ;
- secret `SNYK_TOKEN` ;
- variable `STAGING_BASE_URL`.

Aucune de ces valeurs ne doit être commitée.

## Exigences spécifiques fintech

Les changements concernant paiements, wallets, ledger, cartes, agents, KYC, administration, secteur public ou rôles privilégiés doivent inclure des tests négatifs d’autorisation. Un utilisateur, agent, commerçant, entreprise, administration ou tenant ne doit jamais pouvoir lire ou modifier les données d’un autre tenant sans autorisation explicite.

Les opérations financières doivent rester idempotentes, auditables et protégées contre les doubles traitements. Les décisions de sécurité importantes ne doivent pas dépendre uniquement du client mobile ou web.
