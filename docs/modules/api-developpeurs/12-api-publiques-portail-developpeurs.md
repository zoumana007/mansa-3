# 12 — API publiques & Portail développeurs

## 1. Objectif

Le module API publiques & Portail développeurs permet à des entreprises, commerçants, intégrateurs, administrations, fintechs partenaires et éditeurs logiciels d’intégrer les capacités MANSA de manière sécurisée, documentée, versionnée et contrôlable sans dépendre d’intégrations ad hoc codées au cas par cas.

Le principe directeur est : **aucun accès externe implicite**. Chaque organisation, application, environnement, clé, jeton, scope, quota, webhook, tarif et capacité est explicitement créé, limité, audité, révocable et gouverné par le Super Admin MANSA.

MANSA ne doit jamais exposer directement ses systèmes internes ou son ledger primaire. Les API publiques passent par une couche d’API Gateway dédiée, des contrats stables, des politiques de sécurité, de limitation, d’idempotence, de validation et de journalisation.

## 2. Périmètre fonctionnel

Le module couvre :

- portail développeurs MANSA ;
- création d’organisations développeurs ;
- applications clientes ;
- environnements `SANDBOX`, `STAGING/RECETTE` et `PRODUCTION` ;
- clés API et secrets ;
- OAuth2/OIDC lorsque pertinent ;
- authentification serveur-à-serveur ;
- scopes et permissions fines ;
- API REST publiques ;
- webhooks signés ;
- SDK officiels lorsque disponibles ;
- documentation interactive ;
- exemples de requêtes et réponses ;
- OpenAPI/Swagger publié ;
- catalogue de capacités ;
- quotas et rate limits ;
- idempotency keys ;
- versioning API ;
- journaux techniques ;
- métriques d’usage ;
- supervision des intégrations ;
- suspension/révocation ;
- gestion des incidents ;
- gestion des frais, commissions et abonnements API ;
- support développeurs ;
- tests de conformité avant passage en production.

Hors périmètre : exposition directe de credentials partenaires, accès illimité aux données utilisateur, accès au back-office interne, contournement du consentement, possibilité pour un partenaire de modifier librement des règles réglementaires, ou promesse d’une capacité dépendante d’un partenaire externe non contracté.

## 3. Acteurs

- `DEVELOPER_USER` : utilisateur développeur rattaché à une organisation.
- `DEVELOPER_ORG_ADMIN` : admin de l’organisation partenaire.
- `INTEGRATOR` : intégrateur technique autorisé.
- `PARTNER_APP` : application cliente enregistrée.
- `MANSA_API_ADMIN` : admin opérationnel des API.
- `MANSA_SECURITY_ADMIN` : sécurité, clés, incidents, blocages.
- `MANSA_BILLING_ADMIN` : tarifs, commissions, facturation API.
- `MANSA_COMPLIANCE` : validation conformité et périmètres sensibles.
- `SUPER_ADMIN` : contrôle global.

## 4. Parcours développeur

### 4.1 Création du compte développeur

Le partenaire crée ou reçoit une organisation développeur. Selon le niveau de risque, MANSA peut exiger KYB, documents société, domaine vérifié, contacts techniques, contact sécurité et bénéficiaire effectif.

États organisation : `DRAFT`, `PENDING_REVIEW`, `ACTIVE`, `RESTRICTED`, `SUSPENDED`, `REJECTED`, `CLOSED`.

### 4.2 Création d’une application

Une organisation crée une application avec :

- nom ;
- description ;
- type d’intégration ;
- environnement ;
- URL de redirection si OAuth ;
- domaines autorisés ;
- IP autorisées optionnelles ;
- scopes demandés ;
- webhooks ;
- contacts techniques ;
- pays d’usage ;
- cas d’usage déclaré.

États : `DRAFT`, `REVIEW_REQUIRED`, `SANDBOX_ACTIVE`, `PRODUCTION_PENDING`, `PRODUCTION_ACTIVE`, `SUSPENDED`, `REVOKED`.

### 4.3 Sandbox

La sandbox fonctionne avec des données fictives ou scénarios simulés. Aucun mouvement d’argent réel n’est possible. Elle doit pouvoir simuler succès, échec, timeout, doublon, webhook retardé, fraude, KYC requis et service partenaire indisponible.

### 4.4 Passage en production

Le passage en production peut nécessiter :

- KYB validé ;
- contrat actif ;
- conformité sécurité ;
- scopes validés ;
- tests d’intégration ;
- webhook vérifié ;
- limites définies ;
- grille tarifaire affectée ;
- responsable interne approbateur ;
- date d’effet.

Aucun passage en production ne doit être automatique pour un scope sensible.

## 5. Authentification et autorisation

Modes supportés selon le cas d’usage :

1. **API Key + secret** pour intégrations serveur-à-serveur simples, derrière TLS obligatoire.
2. **OAuth 2.1 / OIDC** pour applications nécessitant consentement utilisateur.
3. **Client Credentials** pour machine-to-machine.
4. **mTLS** optionnel pour partenaires à haut niveau de sécurité.
5. **JWT signé** pour certains échanges partenaires contractuels.

Les secrets ne sont affichés qu’à la création et stockés sous forme sécurisée. Rotation obligatoire ou recommandée selon criticité. Les logs ne doivent jamais contenir le secret complet.

Les scopes sont explicites, par exemple :

- `wallets:read` ;
- `payments:create` ;
- `payments:read` ;
- `refunds:create` ;
- `customers:read_limited` ;
- `kyc:status_read` ;
- `invoices:read` ;
- `invoices:pay` ;
- `passes:issue` ;
- `webhooks:manage` ;
- `transactions:read`.

Les scopes réels doivent rester alignés sur les modules disponibles et la réglementation du pays.

## 6. API Gateway publique

Architecture recommandée :

`Client externe -> WAF/API Gateway -> Auth -> Rate Limit -> Policy/Scopes -> Validation -> Service métier -> Ledger/Partenaire via service interne`

La gateway applique :

- TLS ;
- validation schéma ;
- tailles maximales ;
- rate limiting ;
- quotas ;
- protection DDoS/WAF ;
- idempotence ;
- correlation ID ;
- trace ID ;
- règles pays ;
- scopes ;
- feature flags ;
- journalisation ;
- masquage PII ;
- détection d’abus.

## 7. Idempotence et opérations financières

Toute API pouvant créer un effet financier exige un `Idempotency-Key` unique par intention métier.

MANSA conserve le résultat d’une requête idempotente pendant une durée configurable. Une répétition avec la même clé et le même payload retourne le même résultat logique. Une même clé avec payload différent est rejetée.

Une réponse HTTP `200` ou `201` ne doit jamais être l’unique preuve qu’un paiement est définitivement réglé : le statut métier est explicite.

États génériques : `CREATED`, `PENDING`, `PROCESSING`, `SUCCEEDED`, `FAILED`, `CANCELLED`, `REVERSED`, `EXPIRED`, `REQUIRES_ACTION`.

## 8. Modèle d’API et conventions

Conventions obligatoires :

- JSON UTF-8 ;
- timestamps ISO 8601 UTC ;
- montants en unité mineure entière (`amountMinor`) ;
- devise ISO 4217 ;
- IDs opaques non séquentiels ;
- pagination curseur ;
- filtres documentés ;
- erreurs normalisées ;
- version explicite ;
- `requestId` et `correlationId` ;
- champs extensibles sans casser les consommateurs.

Exemple d’erreur :

```json
{
  "error": {
    "code": "INSUFFICIENT_SCOPE",
    "message": "Le scope requis n'est pas autorisé pour cette application.",
    "requestId": "req_xxx"
  }
}
```

## 9. Versioning et compatibilité

Version majeure dans le chemin ou en-tête, par exemple `/v1/...`.

Règles :

- ajout de champ facultatif = compatible ;
- suppression/renommage/changement sémantique = nouvelle version majeure ;
- période de dépréciation documentée ;
- date de fin annoncée ;
- métriques sur consommateurs encore actifs ;
- blocage d’une vieille version uniquement après gouvernance adaptée, sauf urgence sécurité.

## 10. Webhooks

Les webhooks sont essentiels pour les événements asynchrones.

Chaque endpoint webhook possède :

- URL ;
- événements abonnés ;
- secret de signature ;
- statut ;
- environnement ;
- historique de livraisons ;
- politique de retry ;
- dead-letter logique ;
- possibilité de rejouer un événement autorisé.

Événements possibles :

- `payment.succeeded` ;
- `payment.failed` ;
- `payment.reversed` ;
- `refund.updated` ;
- `kyc.updated` ;
- `invoice.updated` ;
- `pass.used` ;
- `subscription.updated` ;
- `payout.updated`.

Signature HMAC ou mécanisme supérieur configuré. Le partenaire doit vérifier signature, timestamp et tolérance anti-replay.

MANSA ne garantit pas une livraison exactement une fois : modèle **at least once**, donc les consommateurs doivent être idempotents.

## 11. Portail développeurs

Le portail contient :

- tableau de bord ;
- applications ;
- clés et rotations ;
- scopes ;
- environnements ;
- webhooks ;
- logs récents ;
- statistiques ;
- quotas ;
- consommation ;
- facture/coûts ;
- documentation ;
- changelog ;
- statut des services ;
- tickets support ;
- demandes d’accès production.

Les secrets ne doivent jamais être récupérables en clair après création.

## 12. Documentation et SDK

Documentation publique/privée selon produit :

- démarrage rapide ;
- authentification ;
- erreurs ;
- pagination ;
- idempotence ;
- webhooks ;
- sécurité ;
- exemples ;
- recettes Sandbox ;
- OpenAPI téléchargeable ;
- changelog ;
- guides de migration.

SDK possibles : JavaScript/TypeScript, Python, Java/Kotlin, PHP ou autres selon demande réelle. Les SDK ne doivent être publiés que s’ils sont maintenus, testés et versionnés.

## 13. Modèles de données

### DeveloperOrganization

- `id`
- `legalName`
- `displayName`
- `countryCode`
- `kybStatus`
- `status`
- `riskTier`
- `billingAccountId`
- `createdAt`

### DeveloperApplication

- `id`
- `organizationId`
- `name`
- `environment`
- `status`
- `clientType`
- `allowedScopes[]`
- `allowedCountries[]`
- `redirectUris[]`
- `allowedOrigins[]`
- `allowedIps[]`
- `pricingPlanId`

### ApiCredential

- `id`
- `applicationId`
- `keyPrefix`
- `secretHashOrVaultRef`
- `status`
- `createdAt`
- `expiresAt`
- `lastUsedAt`
- `rotatedFromId`

### ApiUsageRecord

- `id`
- `applicationId`
- `endpoint`
- `method`
- `statusCode`
- `latencyMs`
- `requestId`
- `countryCode`
- `billableUnit`
- `pricingSnapshotId`
- `createdAt`

### WebhookEndpoint

- `id`
- `applicationId`
- `url`
- `events[]`
- `secretRef`
- `status`
- `failureCount`
- `lastDeliveryAt`

### WebhookDelivery

- `id`
- `endpointId`
- `eventId`
- `attempt`
- `status`
- `responseCode`
- `durationMs`
- `nextRetryAt`

## 14. RBAC / ABAC

RBAC définit les rôles ; ABAC complète avec :

- organisation ;
- application ;
- environnement ;
- pays ;
- scope ;
- niveau de risque ;
- statut KYB ;
- contrat ;
- heure/canal ;
- plafond ;
- IP ou origine si configurée.

Un admin d’une organisation A ne peut jamais voir les clés, logs ou applications de l’organisation B.

Toute élévation de scope sensible requiert approbation et audit.

## 15. Rate limits, quotas et anti-abus

Limites configurables par :

- application ;
- endpoint ;
- organisation ;
- pays ;
- environnement ;
- plan tarifaire ;
- niveau de risque.

Types : requêtes/seconde, requêtes/minute, transactions/jour, volume financier, nombre de webhooks, stockage logs, etc.

Réponse `429` documentée avec stratégie de retry/backoff.

Détection d’abus : pics anormaux, credential stuffing, scraping, scans, taux d’erreurs inhabituel, répétitions frauduleuses, tentatives hors scope.

## 16. Pricing & Commission Engine

La tarification des API est gérée par le moteur central MANSA, sans modification de code.

Paramètres possibles :

- abonnement fixe ;
- coût par appel ;
- coût par opération réussie ;
- pourcentage transactionnel ;
- fixe + pourcentage ;
- minimum/maximum ;
- paliers par volume ;
- quota gratuit ;
- opérations gratuites ;
- promotions ;
- pays ;
- devise ;
- endpoint ;
- produit ;
- partenaire ;
- type de client ;
- environnement ;
- commission MANSA ;
- commission partenaire ;
- commission apporteur ;
- taxes séparées ;
- date de début/fin.

Workflow : `DRAFT -> SIMULATED -> PENDING_APPROVAL -> SCHEDULED -> ACTIVE -> RETIRED`.

Chaque appel ou transaction facturable conserve un `pricingSnapshotId` immuable avec le détail réellement appliqué. Un changement futur ne modifie jamais les historiques.

L’administration doit permettre simulation d’impact avant activation, approbation des changements sensibles et audit complet.

## 17. Multi-pays et multi-devises

Chaque API et scope peut être activé/désactivé par pays. Les règles réglementaires, limites, fournisseurs disponibles et produits diffèrent selon juridiction.

La devise d’un montant est toujours explicite. Aucune conversion implicite. Une conversion éventuelle passe par le module Change/Multi-devises avec taux, frais et snapshot séparés.

## 18. Données personnelles et minimisation

- ne renvoyer que les champs requis par le scope ;
- masquer les données sensibles dans les logs ;
- ne jamais loguer secrets, PIN, CVV ou tokens complets ;
- durée de conservation configurable selon données et obligations ;
- export/suppression selon droits applicables et contraintes réglementaires ;
- chiffrement en transit et au repos ;
- séparation sandbox/production ;
- accès support justifié et audité.

## 19. Sécurité

Mesures minimales :

- TLS moderne ;
- WAF ;
- secrets en vault/KMS ;
- rotation ;
- signatures ;
- anti-replay ;
- CSRF/PKCE lorsque pertinents ;
- validation stricte des entrées ;
- protection SSRF pour URLs webhook ;
- allowlist réseau optionnelle ;
- journaux immuables des actions sensibles ;
- alertes sécurité ;
- revocation immédiate des credentials compromis ;
- scans de dépendances et tests sécurité continus.

## 20. Audit

Audit obligatoire pour :

- création/suppression d’application ;
- création/rotation/révocation de clé ;
- modification scopes ;
- passage production ;
- modification limites ;
- modification tarifs ;
- changement webhook ;
- rejouage d’événement ;
- suspension ;
- accès support ;
- action Super Admin.

Chaque entrée contient acteur, date, cible, action, justification éventuelle, ancienne/nouvelle valeur lorsque applicable et correlation ID.

## 21. Feature flags

Exemples :

- `developer_portal_enabled`
- `public_api_enabled`
- `oauth_enabled`
- `webhooks_enabled`
- `sdk_downloads_enabled`
- `production_self_service_request_enabled`
- `api_billing_enabled`
- `mTLS_enabled`

Flags évalués par pays, organisation, environnement et produit lorsque nécessaire.

## 22. Résilience et disponibilité

- timeouts explicites ;
- retries uniquement sur erreurs sûres ;
- circuit breakers ;
- queues pour webhooks ;
- backoff exponentiel ;
- dead-letter queues ;
- dégradation contrôlée ;
- statut service ;
- SLO/SLA configurés selon contrat ;
- pas de retry aveugle sur opération financière non idempotente.

Le portail peut être indisponible sans interrompre les transactions API déjà autorisées, tant que les composants critiques restent sains.

## 23. Observabilité

Mesures :

- RPS ;
- latence p50/p95/p99 ;
- taux 2xx/4xx/5xx ;
- 429 ;
- erreurs par application ;
- taux succès webhook ;
- retards webhook ;
- consommation quotas ;
- volume financier ;
- revenu API ;
- coûts partenaires ;
- anomalies sécurité.

Dashboards internes et vues limitées côté développeur.

## 24. Cas réseau faible

Les applications clientes doivent pouvoir gérer :

- timeout ;
- réponses différées ;
- reprise après coupure ;
- statut `PENDING` ;
- polling raisonné ;
- webhooks retardés ;
- idempotence après reconnexion.

Aucune intégration externe ne doit considérer une absence de réponse comme un échec définitif d’une opération financière.

## 25. Tests

### Fonctionnels

- création organisation/application ;
- clé sandbox ;
- scopes ;
- requête autorisée/interdite ;
- idempotence ;
- webhook ;
- rotation ;
- révocation ;
- passage production ;
- tarification ;
- quota.

### Sécurité

- secret invalide ;
- token expiré ;
- scope escalation ;
- replay ;
- SSRF webhook ;
- brute force ;
- injection ;
- cross-tenant ;
- fuite PII ;
- clé révoquée.

### Résilience/performance

- charge ;
- burst ;
- 429 ;
- timeout partenaire ;
- queue webhook saturée ;
- panne région ;
- retry ;
- duplicate delivery ;
- latence p95/p99.

## 26. Administration

Le Super Admin peut :

- créer/suspendre organisations ;
- valider production ;
- gérer scopes ;
- gérer produits API ;
- définir quotas ;
- définir plans tarifaires ;
- simuler tarifs ;
- voir consommation ;
- révoquer credentials ;
- surveiller webhooks ;
- bloquer un endpoint ou pays ;
- publier une dépréciation ;
- consulter audit et incidents.

Les actions à fort impact peuvent imposer une règle maker-checker.

## 27. Ordre de développement

1. Modèles DeveloperOrganization/Application/Credential.
2. API Gateway + auth + scopes + rate limits.
3. Sandbox.
4. Documentation OpenAPI.
5. Idempotence et erreurs normalisées.
6. Webhooks signés.
7. Portail développeurs.
8. Usage metering.
9. Pricing & Commission integration.
10. Production approval workflow.
11. Observabilité et sécurité avancée.
12. SDK officiels selon demande réelle.

## 28. Critères d’acceptation

Le module est accepté lorsque :

- une organisation peut créer une application sandbox ;
- les credentials sont générés, masqués, rotatifs et révocables ;
- les scopes empêchent l’accès non autorisé ;
- une opération financière est idempotente ;
- les webhooks sont signés, rejouables de façon contrôlée et résistants aux doublons ;
- les quotas/rate limits sont configurables ;
- le passage en production est gouverné ;
- les tarifs peuvent être modifiés sans changer le code ;
- chaque usage facturable conserve son snapshot tarifaire ;
- l’audit couvre toutes les actions sensibles ;
- sandbox et production sont strictement séparées ;
- aucune donnée sensible ou secret ne fuit dans les logs ;
- les API restent multi-pays, multi-devises et pilotées par feature flags ;
- la documentation correspond réellement aux contrats exposés ;
- les tests sécurité, résilience et charge critiques passent.

## 29. Contraintes partenaires

Toute API dépendant d’une banque, d’un opérateur Mobile Money, d’un acquéreur carte, d’un assureur, d’un courtier, d’un acteur crypto, d’un fournisseur de factures, d’un opérateur télécom ou d’une administration reste derrière un adaptateur interne.

La documentation publique MANSA ne doit annoncer comme disponible que ce qui est réellement activé dans l’environnement et le pays concernés. Un exemple ou une interface technique ne vaut jamais contrat commercial ni autorisation réglementaire.