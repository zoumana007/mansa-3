# Cahier des charges — Plateforme développeur, API partenaires, webhooks et sandbox

## 1. Objet

Ce document définit la plateforme développeur Mansa destinée aux entreprises, commerçants, banques, opérateurs, administrations, fintechs, intégrateurs, éditeurs de logiciels, partenaires techniques et équipes internes qui doivent intégrer les services Mansa par API.

La plateforme doit permettre de découvrir les API disponibles, créer des applications partenaires, obtenir des identifiants adaptés à chaque environnement, tester des scénarios en sandbox, recevoir des webhooks, suivre les consommations, diagnostiquer les erreurs, gérer les versions, contrôler les permissions et préparer un passage en production sans exposer de secret dans le code ou dans Git.

Elle complète les domaines existants de paiements, wallets, cartes, agents, commerce, secteur public, péages, Mobile Money, notifications, identité, sécurité, observabilité, remboursements, payouts et gestion des équipements. Elle ne remplace pas leurs règles métier.

## 2. Principes directeurs

1. Une intégration partenaire ne doit recevoir que les permissions nécessaires à son usage.
2. Les environnements `SANDBOX`, `STAGING` et `PRODUCTION` sont strictement séparés.
3. Aucun secret de production ne doit être affiché à nouveau après sa création, stocké en clair dans Git, ou envoyé dans les logs.
4. Les clés et secrets doivent être révocables, rotatifs et auditables.
5. Les webhooks doivent être signés, idempotents, rejouables de façon contrôlée et observables.
6. Toute API financière doit supporter une clé d’idempotence lorsque le risque de double traitement existe.
7. Les erreurs doivent être stables, documentées et exploitables par machine.
8. Les permissions et quotas doivent pouvoir différer par organisation, application, pays, environnement et produit.
9. L’API publique ne doit pas exposer les détails internes de l’architecture Mansa.
10. Toute version obsolète doit suivre une politique de dépréciation explicite.
11. Le portail développeur doit refléter les capacités réellement activées pour le partenaire.
12. Les appels critiques doivent être traçables de bout en bout avec un identifiant de corrélation.
13. Les données personnelles ou financières retournées doivent respecter le principe de minimisation.
14. Les intégrations État, banques, opérateurs et grands comptes peuvent utiliser des politiques de sécurité renforcées sans créer une API parallèle non gouvernée.
15. Les API doivent fonctionner avec des réseaux intermittents côté client sans provoquer de doubles opérations.

## 3. Périmètre

La plateforme couvre notamment :

- portail développeur web ;
- catalogue API ;
- documentation OpenAPI ;
- guides d’intégration ;
- applications partenaires ;
- API keys ;
- OAuth 2.0 / OpenID Connect lorsque pertinent ;
- client credentials pour serveur-à-serveur ;
- certificats mTLS pour partenaires sensibles ;
- sandbox ;
- données de test ;
- simulateurs d’événements ;
- webhooks ;
- signatures de webhooks ;
- journaux de livraison ;
- replay contrôlé ;
- quotas ;
- rate limiting ;
- métriques d’usage ;
- journal d’audit ;
- versionnement ;
- dépréciation ;
- SDK officiels éventuels ;
- collection Postman ou équivalent ;
- console de test ;
- demandes d’accès production ;
- validation conformité partenaire ;
- support développeur ;
- statut des services.

## 4. Entités recommandées

```text
DeveloperOrganization
DeveloperUser
PartnerApplication
ApplicationEnvironment
ApiCredential
ApiKey
OAuthClient
ClientCertificate
ApiScope
ApplicationScopeGrant
ApiProduct
ApiVersion
ApiRequestLog
ApiUsageAggregate
RateLimitPolicy
QuotaPolicy
WebhookEndpoint
WebhookSubscription
WebhookSecret
WebhookDelivery
WebhookDeliveryAttempt
WebhookEvent
WebhookReplayRequest
SandboxProfile
SandboxFixture
SandboxScenario
ProductionAccessRequest
DeveloperAuditLog
SdkRelease
DocumentationRelease
```

## 5. Organisations développeur

Une `DeveloperOrganization` représente le partenaire intégrateur.

Champs minimaux :

```text
organizationId
legalName
tradeName
countryCode
organizationType
status
riskLevel
technicalContacts
securityContacts
billingContact
createdAt
approvedAt
```

Types possibles :

```text
MERCHANT
ENTERPRISE
BANK
FINTECH
MOBILE_OPERATOR
GOVERNMENT
PUBLIC_AGENCY
INTEGRATOR
SOFTWARE_VENDOR
TRANSPORT_OPERATOR
TOLL_CONCESSIONAIRE
INTERNAL
OTHER
```

## 6. Applications partenaires

Chaque intégration doit être représentée par une `PartnerApplication` distincte.

Exemples :

- application e-commerce ;
- ERP entreprise ;
- backend banque ;
- portail État ;
- application de transport ;
- système de caisse ;
- service de facturation ;
- système de péage ;
- plateforme de remboursement ;
- application mobile partenaire.

Champs recommandés :

```text
applicationId
organizationId
name
description
applicationType
status
ownerUserId
createdAt
```

Une même organisation peut posséder plusieurs applications avec des droits différents.

## 7. Environnements

Chaque application doit avoir des configurations séparées par environnement :

```text
SANDBOX
STAGING
PRODUCTION
```

Les identifiants d’un environnement ne doivent jamais fonctionner dans un autre.

Les URL, clés, certificats, quotas et webhooks peuvent différer par environnement.

## 8. Catalogue API

Le portail doit présenter uniquement les produits accessibles ou demandables par le partenaire.

Produits possibles :

```text
PAYMENTS
CHECKOUT
WALLETS
TRANSFERS
PAYOUTS
REFUNDS
CARDS
MOBILE_MONEY
MERCHANTS
INVOICING
BILL_PAYMENTS
CASH_IN
CASH_OUT
AGENTS
KYC_KYB
IDENTITY
NOTIFICATIONS
PUBLIC_SECTOR
TOLLING
TRANSPORT
FLEET
REPORTING
WEBHOOKS
```

L’existence d’un produit dans le catalogue ne signifie pas que toutes ses opérations sont disponibles à tous les partenaires.

## 9. Scopes et permissions

Les autorisations doivent être exprimées par scopes explicites.

Exemples :

```text
payments:create
payments:read
payments:refund
wallets:read
wallets:transfer
payouts:create
payouts:read
merchants:read
merchants:write
webhooks:read
webhooks:write
reports:read
public-sector:payments:create
tolling:transactions:read
```

Un scope doit être documenté avec :

- description ;
- sensibilité ;
- données accessibles ;
- opérations autorisées ;
- éventuelles conditions contractuelles ;
- niveau d’approbation requis.

## 10. Principe du moindre privilège

Par défaut, une nouvelle application n’obtient aucun scope sensible.

Les scopes sont accordés selon :

```text
organization
application
environment
country
product
contract
riskLevel
complianceStatus
```

Les permissions inutilisées ou expirées doivent pouvoir être retirées.

## 11. API keys

Les API keys conviennent notamment aux usages serveur-à-serveur simples lorsque le niveau de risque l’autorise.

Principes :

- identifiant public + secret ;
- secret révélé une seule fois ;
- hash ou stockage sécurisé côté Mansa ;
- préfixe permettant d’identifier l’environnement sans révéler le secret ;
- date de création ;
- dernière utilisation ;
- date d’expiration facultative ou obligatoire selon politique ;
- révocation ;
- rotation ;
- nom descriptif ;
- restriction éventuelle par IP ou réseau.

Exemple de métadonnées :

```text
credentialId
applicationId
environment
keyPrefix
status
createdBy
createdAt
lastUsedAt
expiresAt
revokedAt
```

## 12. Rotation des clés

La rotation doit pouvoir se faire sans interruption.

Workflow recommandé :

```text
ACTIVE_KEY_A
→ CREATE_KEY_B
→ A_AND_B_VALID
→ PARTNER_MIGRATES
→ REVOKE_KEY_A
→ KEY_B_ONLY
```

Les rotations doivent être auditables.

## 13. OAuth 2.0

Pour les scénarios nécessitant une délégation d’accès ou une identité utilisateur, Mansa peut utiliser OAuth 2.0 et OpenID Connect.

Flux autorisés selon usage :

```text
CLIENT_CREDENTIALS
AUTHORIZATION_CODE + PKCE
DEVICE_AUTHORIZATION si justifié
```

Les flux historiques faibles ou inadaptés ne doivent pas être activés par défaut.

## 14. Client credentials

Le flux `client_credentials` est recommandé pour les intégrations serveur-à-serveur nécessitant des tokens courts.

Le token doit inclure uniquement les claims nécessaires :

```text
client_id
organization_id
environment
scopes
aud
iss
iat
exp
jti
```

Les tokens d’accès doivent avoir une durée limitée.

## 15. mTLS

Les partenaires à forte sensibilité peuvent être soumis à mTLS.

Cas typiques :

- banque ;
- opérateur de paiement ;
- infrastructure État ;
- acquisition carte ;
- clearing ;
- grands flux financiers ;
- certains systèmes de péage ou de transport.

Les certificats doivent être renouvelables et révocables sans recréer l’application.

## 16. Restriction réseau

Une application peut avoir des restrictions :

```text
allowedIpRanges
allowedCountries
allowedNetworks
mtlsRequired
vpnRequiredIfContracted
```

La restriction IP ne doit jamais être le seul mécanisme d’authentification.

## 17. Format des requêtes

Les API REST publiques doivent utiliser des conventions cohérentes.

Principes :

- JSON UTF-8 ;
- timestamps ISO 8601 ;
- montants en unités mineures ou structure monétaire clairement définie ;
- devise ISO 4217 (`XOF`, `EUR`, etc.) ;
- identifiants opaques ;
- pas de dépendance à un ordre de champs ;
- champs optionnels explicitement documentés.

## 18. Montants

Les montants financiers ne doivent pas être transportés en flottants binaires ambigus.

Exemple recommandé :

```json
{
  "amount": 100000,
  "currency": "XOF"
}
```

La documentation doit préciser si `amount` représente l’unité mineure applicable à la devise.

## 19. Identifiants

Les identifiants externes doivent être opaques et stables.

Exemples :

```text
pay_...
trf_...
pout_...
rfnd_...
wh_...
app_...
```

Le format interne de base de données ne doit pas être une dépendance contractuelle de l’API.

## 20. Idempotence

Toute opération financière créatrice ou irréversible doit supporter une clé d’idempotence.

Header recommandé :

```text
Idempotency-Key: <unique-partner-value>
```

Règles :

- portée par application et endpoint ;
- taille maximale définie ;
- conservation configurable ;
- même clé + même payload → même résultat logique ;
- même clé + payload différent → erreur explicite ;
- aucun double débit en cas de retry réseau.

## 21. Corrélation

Chaque requête doit recevoir un identifiant de corrélation.

Headers possibles :

```text
X-Request-Id
X-Correlation-Id
```

Le partenaire doit pouvoir fournir son propre identifiant dans les limites autorisées, tandis que Mansa conserve un identifiant interne de traçage.

## 22. Réponses

Une réponse réussie doit rester stable et concise.

Exemple :

```json
{
  "id": "pay_123",
  "status": "PENDING",
  "amount": 100000,
  "currency": "XOF",
  "createdAt": "2026-08-10T10:00:00Z"
}
```

Les données inutiles ne doivent pas être retournées par défaut.

## 23. Erreurs

Les erreurs doivent être structurées.

Exemple :

```json
{
  "error": {
    "code": "INSUFFICIENT_FUNDS",
    "message": "Operation cannot be completed",
    "requestId": "req_123",
    "details": []
  }
}
```

Le message public ne doit pas révéler de détail interne sensible.

## 24. Codes d’erreur

Exemples :

```text
INVALID_REQUEST
AUTHENTICATION_REQUIRED
INVALID_CREDENTIAL
PERMISSION_DENIED
RESOURCE_NOT_FOUND
CONFLICT
IDEMPOTENCY_CONFLICT
RATE_LIMITED
INSUFFICIENT_FUNDS
LIMIT_EXCEEDED
KYC_REQUIRED
ACCOUNT_RESTRICTED
PROVIDER_UNAVAILABLE
TEMPORARY_FAILURE
INTERNAL_ERROR
```

Chaque code doit avoir une documentation et une stratégie de retry.

## 25. Retry

Les partenaires doivent savoir quelles erreurs sont retryables.

Exemple de classification :

```text
400 → ne pas retry sans correction
401 → renouveler/authentifier puis retry selon cas
403 → ne pas retry sans changement d’autorisation
409 → dépend du code métier
429 → retry avec backoff
5xx → retry borné avec backoff + jitter
```

Les opérations financières restent protégées par idempotence.

## 26. Rate limiting

Le rate limiting doit être configurable par :

```text
organization
application
environment
apiProduct
endpoint
riskLevel
```

Headers recommandés lorsque compatibles :

```text
RateLimit-Limit
RateLimit-Remaining
RateLimit-Reset
Retry-After
```

Les limites doivent protéger la plateforme sans rendre les erreurs opaques.

## 27. Quotas

Un quota peut être exprimé sur une période plus longue que le rate limit.

Exemples :

- appels par jour ;
- transactions par jour ;
- montant cumulé ;
- nombre de bénéficiaires ;
- webhooks par période ;
- exports de rapport.

Les quotas financiers doivent être séparés des quotas purement techniques.

## 28. Sandbox

La sandbox doit permettre de développer sans utiliser de fonds réels.

Elle doit proposer :

- comptes fictifs ;
- wallets fictifs ;
- commerçants fictifs ;
- paiements simulés ;
- Mobile Money simulé ;
- cartes de test ;
- événements KYC simulés ;
- remboursements simulés ;
- webhooks ;
- erreurs contrôlables ;
- scénarios de latence ;
- cas d’expiration ;
- cas de doublon ;
- cas de provider indisponible.

Aucune donnée réelle de client ne doit être nécessaire.

## 29. Données sandbox

Les fixtures doivent être documentées et stables.

Exemple :

```text
customer_success
customer_kyc_pending
customer_restricted
wallet_funded
wallet_empty
card_approved
card_declined
mobile_money_success
mobile_money_timeout
```

Les identifiants de test doivent être clairement distinguables de la production.

## 30. Scénarios déterministes

Le partenaire doit pouvoir provoquer certains résultats de test sans hasard.

Exemple :

```text
amount=1001 → success
amount=1002 → decline
amount=1003 → timeout
```

ou, de préférence, par paramètre/simulation dédiée lorsque cela évite de surcharger la logique métier.

La méthode retenue doit être documentée et confinée à la sandbox.

## 31. Console API

Le portail peut proposer une console permettant :

- sélectionner un endpoint ;
- choisir l’environnement ;
- injecter une clé sandbox ;
- éditer le body ;
- envoyer une requête ;
- voir headers, statut et body ;
- copier un exemple curl ;
- afficher le `requestId`.

La console de production doit être désactivée ou fortement contrôlée pour les opérations sensibles.

## 32. Documentation OpenAPI

Chaque API publique doit être décrite par OpenAPI versionné.

La spécification doit inclure :

- endpoints ;
- auth ;
- paramètres ;
- schémas ;
- exemples ;
- erreurs ;
- idempotence ;
- rate limits ;
- webhooks ;
- statut de dépréciation.

La documentation générée ne remplace pas les guides métier.

## 33. Guides d’intégration

Guides recommandés :

```text
Quickstart
Authentification
Créer un paiement
Suivre un paiement
Rembourser
Recevoir un webhook
Gérer l’idempotence
Tester en sandbox
Passer en production
Sécuriser les clés
Diagnostiquer une erreur
```

## 34. Exemples de code

Les exemples doivent éviter les mauvaises pratiques.

Ils ne doivent jamais :

- contenir de clé réelle ;
- désactiver TLS ;
- ignorer la validation de signature ;
- stocker un secret côté frontend ;
- logger un token complet ;
- recommander un retry non idempotent.

## 35. SDK

Des SDK officiels peuvent être fournis pour les langages prioritaires.

Exemples :

```text
JavaScript / TypeScript
Python
Java / Kotlin
PHP
.NET
Go
```

Un SDK doit rester une couche mince au-dessus de l’API et ne pas masquer les règles métier importantes.

## 36. Versionnement API

Le versionnement doit être explicite.

Exemple :

```text
/v1/payments
/v1/refunds
```

Une évolution compatible peut rester dans la même version ; une rupture contractuelle nécessite une stratégie de version majeure ou une méthode équivalente documentée.

## 37. Compatibilité

Les changements suivants sont considérés comme potentiellement cassants :

- suppression de champ ;
- changement de type ;
- nouvelle valeur obligatoire ;
- modification de sémantique ;
- réduction de plage autorisée ;
- suppression d’un code d’état utilisé ;
- changement d’authentification ;
- changement de signature webhook.

L’ajout d’un champ optionnel ne doit pas casser les clients correctement implémentés.

## 38. Dépréciation

Une API dépréciée doit avoir :

```text
status = DEPRECATED
announcementDate
sunsetDate
replacementVersion
migrationGuide
```

Les partenaires impactés doivent pouvoir être identifiés et notifiés.

## 39. Webhooks

Les webhooks permettent à Mansa de notifier un partenaire sans polling permanent.

Exemples d’événements :

```text
payment.created
payment.processing
payment.succeeded
payment.failed
refund.succeeded
refund.failed
payout.processing
payout.succeeded
payout.failed
wallet.updated
kyc.updated
merchant.updated
agent.updated
toll.transaction.completed
```

La nomenclature doit être stable.

## 40. Endpoint webhook

Un endpoint doit enregistrer :

```text
webhookEndpointId
applicationId
environment
url
status
eventTypes
secretVersion
createdAt
lastSuccessAt
lastFailureAt
```

La production doit exiger HTTPS.

## 41. Vérification d’URL

Lors de l’ajout d’un webhook, Mansa peut effectuer une vérification contrôlée afin de confirmer que le partenaire maîtrise l’endpoint.

Les redirections doivent être limitées et les cibles privées ou dangereuses doivent être bloquées pour réduire le risque SSRF.

## 42. Signature webhook

Chaque livraison doit être signée.

Schéma recommandé :

```text
Webhook-Id: evt_...
Webhook-Timestamp: 1786352400
Webhook-Signature: v1=<signature>
```

La signature peut utiliser HMAC-SHA256 ou un mécanisme plus fort selon politique.

Le contenu signé doit inclure l’identifiant, le timestamp et le body brut.

## 43. Protection anti-replay

Le partenaire doit vérifier :

- signature ;
- timestamp ;
- fenêtre de tolérance ;
- identifiant d’événement déjà traité.

La documentation doit fournir un exemple correct.

## 44. Secret webhook

Un secret webhook est propre à :

```text
application
environment
endpoint ou groupe selon politique
```

Il doit pouvoir être rotaté avec période de chevauchement.

## 45. Livraison

Une livraison doit enregistrer :

```text
deliveryId
eventId
endpointId
attemptNumber
requestedAt
completedAt
httpStatus
latencyMs
result
nextAttemptAt
```

Le body de réponse du partenaire ne doit pas être conservé intégralement s’il peut contenir des secrets ou données sensibles.

## 46. Retry webhook

Politique recommandée :

```text
attempt 1 → immédiat
attempt 2 → +1 min
attempt 3 → +5 min
attempt 4 → +30 min
attempt 5 → +2 h
attempt 6 → +12 h
```

Les valeurs réelles restent configurables.

Le retry doit utiliser un backoff borné et ne pas générer une tempête de requêtes.

## 47. Réponse attendue du partenaire

Toute réponse HTTP `2xx` peut être considérée comme acceptée selon la politique.

Les `4xx` et `5xx` doivent être classés pour déterminer le retry.

Un `410 Gone` peut désactiver l’endpoint après politique explicite.

## 48. Idempotence webhook côté partenaire

Un même événement peut être livré plusieurs fois.

La documentation doit imposer :

```text
process once by eventId
```

Le partenaire ne doit pas supposer « exactement une livraison ».

## 49. Ordre des événements

Mansa ne doit pas garantir un ordre global lorsque l’architecture ne le permet pas.

Les événements doivent contenir :

- ressource ;
- statut ;
- timestamp ;
- version ou séquence si utile.

Le partenaire doit pouvoir relire la ressource via API pour connaître l’état actuel.

## 50. Replay manuel

Le portail doit permettre de rejouer une livraison dans une fenêtre autorisée.

Le replay doit :

- conserver le même `eventId` ;
- créer un nouveau `deliveryId` ;
- être auditée ;
- ne pas recréer l’événement métier.

## 51. Historique webhooks

L’écran webhook doit afficher :

- événement ;
- endpoint ;
- date ;
- code HTTP ;
- latence ;
- nombre de tentatives ;
- statut ;
- prochaine tentative ;
- bouton replay si autorisé.

Les données sensibles doivent être masquées.

## 52. Désactivation automatique

Un endpoint durablement en échec peut passer :

```text
ACTIVE
DEGRADED
PAUSED
DISABLED
```

La désactivation automatique doit être configurable et notifiée au contact technique.

## 53. Sécurité SSRF

Les URL de webhooks et callbacks doivent être validées.

Interdictions par défaut :

- localhost ;
- loopback ;
- adresses link-local ;
- metadata cloud ;
- réseaux privés non explicitement autorisés ;
- schémas non HTTPS en production ;
- ports interdits.

Les résolutions DNS doivent être protégées contre les contournements connus.

## 54. Journaux API

Les journaux doivent permettre le diagnostic sans fuite de données.

À conserver de manière contrôlée :

```text
requestId
applicationId
organizationId
environment
endpoint
method
statusCode
latencyMs
timestamp
errorCode
```

À ne jamais journaliser en clair :

- secrets API ;
- Authorization complet ;
- PIN ;
- CVV ;
- PAN complet ;
- clé privée ;
- token de refresh ;
- payload KYC brut inutile.

## 55. Observabilité partenaire

Le portail doit présenter :

- nombre d’appels ;
- taux de succès ;
- erreurs par code ;
- latence ;
- consommation quota ;
- rate limits ;
- webhooks en échec ;
- incidents plateforme affectant l’application.

Les métriques ne doivent pas révéler les données d’autres partenaires.

## 56. Alertes

Le partenaire peut configurer des alertes pour :

- clé proche expiration ;
- certificat proche expiration ;
- quota proche limite ;
- webhook dégradé ;
- taux d’erreur élevé ;
- nouvelle version dépréciée ;
- incident majeur.

## 57. Demande d’accès production

Une application sandbox ne doit pas obtenir automatiquement la production.

Workflow recommandé :

```text
DRAFT
TECHNICAL_READY
SECURITY_REVIEW
COMPLIANCE_REVIEW
CONTRACT_CHECK
APPROVED
PRODUCTION_ENABLED
```

Les étapes applicables dépendent du produit et du risque.

## 58. Checklist production

Exigences possibles :

- organisation vérifiée ;
- contrat actif ;
- KYC/KYB partenaire terminé ;
- URL de production confirmée ;
- stockage des secrets validé ;
- webhooks signés ;
- idempotence testée ;
- retries testés ;
- limites connues ;
- contacts d’incident renseignés ;
- test de bout en bout réussi.

## 59. Partenaires sensibles

Pour une banque, administration ou opérateur critique, des exigences supplémentaires peuvent être imposées :

- mTLS ;
- allowlist réseau ;
- double validation administrative ;
- procédure de rotation ;
- tests de reprise ;
- environnement de recette dédié ;
- SLA spécifique ;
- journalisation renforcée ;
- exigences contractuelles de sécurité.

## 60. Domaines État et péages

La plateforme développeur doit pouvoir exposer des API liées au domaine État et aux péages sans modifier les principes de référence déjà établis.

Les deux solutions initiales doivent coexister :

```text
A — péage automatique classique avec barrière
B — télépéage UHF RFID passif avec barrière
```

Une évolution future optionnelle vers du free-flow sans barrière peut être ajoutée sans remplacer A ou B.

Le péage classique peut accepter, selon configuration :

- billets FCFA/XOF ;
- pièces FCFA/XOF ;
- carte bancaire EMV sur les réseaux activés par l’acquéreur, notamment Visa et Mastercard lorsque contractuellement disponibles ;
- NFC ;
- carte Mansa ;
- wallet Mansa ;
- QR ;
- Mobile Money.

Mobile Money reste activable ou désactivable par l’administration au niveau national, réseau, poste ou voie, avec date d’effet, auteur et audit.

## 61. API de configuration péage

Une API partenaire ne doit jamais permettre de contourner les règles administratives.

Exemple de configuration :

```text
paymentChannelScope = NATIONAL | NETWORK | TOLL_PLAZA | LANE
channel = MOBILE_MONEY
status = ENABLED | DISABLED
effectiveAt
reason
approvedBy
```

Chaque changement doit produire un audit immuable.

## 62. Télépéage via API

Le télépéage initial repose sur :

- tag UHF RFID passif ;
- véhicule ;
- compte ou abonnement ;
- lecteur/antenne ;
- contrôleur local ;
- relais `OPEN` ;
- barrière ;
- capteurs de passage.

L’API centrale peut gérer comptes, tags, règles, listes et rapprochements, mais le contrôleur local doit conserver le mode hors ligne sécurisé autorisé.

## 63. Mode hors ligne péage

Une intégration de péage doit supporter :

```text
local cache
signed configuration
transaction queue
idempotent synchronization
conflict detection
no double debit
ordered event reconciliation
```

Le retour réseau ne doit jamais produire un double débit.

## 64. Matériel multi-fournisseurs

Les API matérielles ne doivent pas dépendre d’un fabricant unique.

Les équipements sont intégrés derrière des adaptateurs capables d’utiliser :

```text
REST
SDK constructeur
TCP/IP
USB
RS-232
RS-485
GPIO
relais/contact sec
interface industrielle documentée
```

Les trois niveaux d’équipement doivent rester supportés :

1. voie automatique complète ;
2. voie semi-automatique avec espèces sécurisées ;
3. poste numérisé à faible coût.

## 65. Déploiement progressif

Les API doivent permettre à l’État ou au concessionnaire de déployer progressivement par :

```text
network
region
plaza
lane
site
pilotGroup
```

Aucune architecture ne doit imposer le remplacement simultané de tous les péages.

## 66. Modèles commerciaux matériel

La plateforme doit accepter :

```text
CUSTOMER_OWNED_HARDWARE
MANSA_SUPPLIED_OR_RESELL_HARDWARE
```

L’origine commerciale du matériel ne doit pas changer les exigences de sécurité ou d’audit.

## 67. Marque blanche

Les intégrations doivent exposer la configuration nécessaire à la marque blanche :

- logo ;
- nom exploitant ;
- couleurs ;
- langues ;
- reçus ;
- écrans ;
- tags ;
- signalétique ;
- mention facultative `Propulsé par Mansa`.

Les messages obligatoires de sécurité ne peuvent pas être masqués par le branding.

## 68. Anti-corruption péage

Les API et webhooks du domaine péage doivent permettre de rapprocher :

```text
véhicule détecté
→ catégorie
→ tarif attendu
→ paiement
→ autorisation d’ouverture
→ ouverture réelle
→ passage physique
```

Toute ouverture manuelle doit être auditée.

Un partenaire ne doit pas pouvoir supprimer ou réécrire cet historique par API standard.

## 69. Données sensibles

La plateforme doit classifier les champs sensibles.

Exemples :

```text
PUBLIC
INTERNAL
CONFIDENTIAL
PERSONAL
FINANCIAL
HIGHLY_SENSITIVE
```

Les scopes, masquages et politiques de rétention doivent dépendre de cette classification.

## 70. Protection des secrets côté frontend

Une clé secrète ne doit jamais être intégrée dans :

- application web publique ;
- bundle JavaScript navigateur ;
- application mobile sans protection adaptée ;
- dépôt Git ;
- code d’exemple public.

Les applications clientes doivent utiliser un backend ou un flux OAuth adapté.

## 71. CORS

CORS doit être configuré par application uniquement pour les API destinées au navigateur.

Il ne doit pas être utilisé comme mécanisme d’authentification.

Les origines wildcard sont interdites pour les API sensibles avec credentials.

## 72. TLS

La production doit exiger TLS moderne.

Les certificats invalides, expirés ou les connexions non chiffrées doivent être refusés pour les API publiques sensibles.

## 73. Protection contre abus

La plateforme doit détecter :

- rafales anormales ;
- brute force ;
- scans ;
- credential stuffing ;
- clés utilisées depuis des zones inattendues ;
- volume inhabituel ;
- erreurs répétées ;
- tentatives d’accès à des scopes interdits.

Des blocages automatiques temporaires peuvent être appliqués selon politique.

## 74. Révocation d’urgence

Un administrateur autorisé doit pouvoir :

```text
revoke credential
suspend application
pause webhooks
restrict scopes
block organization
```

Toute action doit être auditée avec motif.

## 75. Statut des services

Le portail développeur doit afficher les incidents pertinents :

- API ;
- paiements ;
- Mobile Money ;
- webhooks ;
- KYC ;
- reporting ;
- sandbox.

Le statut public ne doit pas révéler d’information exploitable pour attaquer l’infrastructure.

## 76. Support développeur

Le support doit permettre de fournir un `requestId` ou `deliveryId` sans envoyer de secret.

Les équipes support doivent pouvoir rechercher les traces correspondantes selon leurs permissions.

## 77. Audit administratif

Actions à auditer :

```text
APPLICATION_CREATED
PRODUCTION_ACCESS_APPROVED
SCOPE_GRANTED
SCOPE_REVOKED
API_KEY_CREATED
API_KEY_ROTATED
API_KEY_REVOKED
CERTIFICATE_ADDED
CERTIFICATE_REVOKED
WEBHOOK_CREATED
WEBHOOK_SECRET_ROTATED
WEBHOOK_REPLAYED
APPLICATION_SUSPENDED
```

Les journaux doivent être immuables selon la politique de sécurité Mansa.

## 78. Rétention

Les durées de rétention doivent être configurables par type :

- logs API ;
- métriques agrégées ;
- payloads webhooks ;
- audit ;
- données sandbox.

Les payloads sensibles doivent avoir une rétention minimale nécessaire.

## 79. Multi-tenant

Toutes les requêtes de portail et API doivent préserver l’isolation entre organisations.

Aucune recherche par identifiant ne doit permettre à une organisation de lire les applications, clés, webhooks ou métriques d’une autre organisation.

Les tests négatifs multi-tenant sont obligatoires.

## 80. Pagination

Les endpoints de liste doivent utiliser une pagination stable.

Approche recommandée : curseur opaque.

```text
limit
nextCursor
```

Une limite maximale doit être imposée.

## 81. Filtrage

Les filtres autorisés doivent être documentés.

Exemples :

```text
status
createdAfter
createdBefore
merchantId
customerId
currency
countryCode
```

Les filtres ne doivent pas permettre d’injection SQL ou d’accès hors tenant.

## 82. Tri

Seuls les champs explicitement autorisés peuvent servir au tri.

Le tri doit rester déterministe avec un identifiant secondaire si nécessaire.

## 83. Exports

Les exports volumineux doivent être asynchrones.

Workflow :

```text
POST /exports
→ exportId
→ PROCESSING
→ READY
→ URL temporaire signée
```

Les URLs doivent expirer et être autorisées pour le bon partenaire.

## 84. Webhooks d’export

Un événement peut annoncer :

```text
report.export.ready
report.export.failed
```

Le partenaire doit ensuite télécharger via une URL autorisée ou API.

## 85. API asynchrones

Les opérations longues doivent retourner un état intermédiaire au lieu de bloquer la connexion.

Exemple :

```text
PENDING
PROCESSING
SUCCEEDED
FAILED
CANCELLED
```

Le statut peut être lu par API et envoyé par webhook.

## 86. Cohérence statuts API / webhooks

Les statuts exposés par webhook doivent correspondre aux statuts lisibles par API.

Un événement ancien ne doit pas faire régresser l’état courant chez le partenaire s’il arrive en retard.

## 87. Données de carte

Les API partenaires ne doivent pas exposer de PAN complet ou CVV sauf architecture spécialisée et conformité contractuelle explicite.

Le principe de tokenisation doit être privilégié.

Les logs et webhooks ne doivent jamais contenir de CVV.

## 88. Mobile Money

Les intégrations Mobile Money doivent rester derrière les adaptateurs Mansa.

Une API partenaire demande une opération Mansa ; elle ne doit pas dépendre du format propriétaire de chaque opérateur sauf module d’intégration dédié.

Les statuts providers sont normalisés vers les statuts Mansa tout en conservant la référence fournisseur pour audit.

## 89. Paiements

Création recommandée :

```text
POST /v1/payments
Idempotency-Key
```

Le paiement doit inclure selon cas :

```text
amount
currency
paymentMethod
merchantId
customerReference
partnerReference
metadata contrôlées
```

Le backend reste la source de vérité.

## 90. Metadata partenaire

Un partenaire peut attacher des métadonnées dans des limites strictes.

Contraintes :

- taille maximale ;
- clés autorisées ou libres selon politique ;
- pas de secrets ;
- pas de PAN/CVV ;
- pas de données personnelles inutiles ;
- valeurs sérialisables simples.

## 91. Références partenaires

Les ressources peuvent exposer :

```text
partnerReference
externalId
merchantReference
```

L’unicité doit être définie explicitement si utilisée pour idempotence métier.

## 92. Webhooks et transactions financières

Un webhook `payment.succeeded` est une notification, pas une autorisation de débiter à nouveau.

Le partenaire doit traiter l’événement comme une transition d’état d’une ressource existante.

## 93. Tests contractuels

Mansa doit maintenir des tests vérifiant :

- schémas OpenAPI ;
- compatibilité des réponses ;
- codes d’erreur ;
- auth ;
- permissions ;
- idempotence ;
- signatures webhook ;
- isolation multi-tenant ;
- rate limits essentiels.

## 94. Tests partenaire avant production

La plateforme peut exiger un test automatique :

```text
create payment
receive webhook
validate signature
retry duplicate request
read final status
perform refund if applicable
```

Le résultat peut alimenter la demande d’accès production.

## 95. CI de documentation

Toute modification d’API publique doit vérifier :

- OpenAPI valide ;
- exemples valides ;
- liens fonctionnels ;
- diff de breaking changes ;
- documentation du nouveau scope ;
- changelog.

## 96. Changelog

Le portail doit afficher :

```text
NEW
CHANGED
DEPRECATED
REMOVED
SECURITY
```

Chaque entrée doit préciser date, API concernée, environnements et action requise.

## 97. Feature flags partenaires

Une nouvelle fonction peut être activée progressivement par :

```text
organization
application
country
environment
percentage
allowlist
```

Un feature flag ne doit pas contourner une permission contractuelle.

## 98. Disponibilité géographique

Les API et produits peuvent varier selon le pays.

Le portail doit distinguer :

```text
AVAILABLE
LIMITED
PILOT
COMING_LATER
NOT_AVAILABLE
```

Il ne doit pas promettre un réseau ou moyen de paiement contractuellement indisponible.

## 99. Gouvernance des API

Toute nouvelle API publique doit avoir :

- owner produit ;
- owner technique ;
- classification de données ;
- scopes ;
- version ;
- SLA interne ;
- stratégie de dépréciation ;
- documentation ;
- tests ;
- audit de sécurité.

## 100. Critères d’acceptation

La plateforme est considérée prête pour une première production lorsque :

- un partenaire peut créer une application sandbox ;
- les secrets sont générés et stockés correctement ;
- les scopes sont appliqués côté serveur ;
- l’isolation multi-tenant est testée ;
- une API financière supporte l’idempotence ;
- les erreurs sont documentées ;
- les webhooks sont signés ;
- les retries webhook fonctionnent ;
- le replay manuel est audité ;
- la sandbox fournit des scénarios déterministes ;
- les métriques d’usage sont disponibles ;
- la rotation des clés est testée ;
- le processus d’accès production est fonctionnel ;
- aucune donnée sensible interdite n’apparaît dans les logs ;
- les règles de péage, Mobile Money, multi-fournisseurs, hors ligne et anti-corruption restent compatibles avec les décisions Mansa existantes.

## 101. Résultat attendu

La plateforme développeur doit permettre à Mansa de devenir intégrable par des systèmes externes sans transformer chaque partenariat en projet spécifique non maintenable.

Le partenaire doit disposer d’une expérience claire en sandbox, d’API cohérentes, de webhooks fiables, de mécanismes de sécurité adaptés au risque, d’un passage en production gouverné et d’une observabilité suffisante pour diagnostiquer ses intégrations.

Le cœur Mansa conserve la maîtrise des règles financières, de l’autorisation, de l’audit, de l’idempotence et des politiques sensibles. Les intégrations restent découplées des fournisseurs, compatibles avec le multi-pays et capables d’évoluer sans casser les partenaires existants.