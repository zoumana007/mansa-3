# Plateforme développeur — API, clés, OAuth, webhooks et sandbox

## 1. Objet

Ce document définit le cahier des charges de la plateforme développeur Mansa destinée aux partenaires techniques, entreprises, administrations, commerçants, intégrateurs, éditeurs de logiciels, fintechs partenaires et équipes internes autorisées.

La plateforme doit permettre d’intégrer Mansa sans exposer les systèmes internes ni créer de dépendances directes à la base de données. Toutes les intégrations externes passent par des API versionnées, des mécanismes d’authentification explicites, des webhooks signés et des environnements séparés.

La plateforme développeur ne remplace pas les applications Mansa. Elle fournit les briques d’intégration nécessaires pour les paiements, wallets, commerce, facturation, identité, secteur public, mobilité, télépéage, notifications, rapports et autres domaines activés contractuellement.

## 2. Principes d’architecture

Principes obligatoires :

- aucune intégration partenaire ne doit accéder directement aux bases de données Mansa ;
- toutes les API externes sont derrière une passerelle API ;
- authentification et autorisation sont séparées ;
- les droits sont accordés au minimum nécessaire ;
- chaque client API est rattaché à une organisation et à un environnement ;
- les données restent isolées par tenant ;
- les secrets ne sont jamais retournés en clair après leur création initiale ;
- toutes les opérations sensibles sont auditables ;
- les opérations financières mutables doivent être idempotentes ;
- les erreurs ne doivent jamais exposer de stack trace, secret ou donnée interne ;
- les intégrations doivent pouvoir être révoquées sans interrompre les autres clients de l’organisation.

## 3. Environnements

Trois environnements logiques sont prévus :

```text
SANDBOX
STAGING / RECETTE
PRODUCTION
```

### 3.1 Sandbox

Le sandbox permet de développer sans argent réel ni donnée de production.

Il doit proposer :

- identités de test ;
- wallets fictifs ;
- transactions simulées ;
- statuts de paiement forcés ;
- événements webhook simulés ;
- scénarios d’échec ;
- scénarios de délai ;
- scénarios de remboursement ;
- scénarios d’expiration ;
- scénarios d’idempotence ;
- scénarios de débit refusé ;
- données réinitialisables.

Aucun secret de production ne doit être valable en sandbox.

### 3.2 Recette

La recette sert aux tests d’intégration avec des systèmes partenaires proches des conditions réelles.

Elle doit rester isolée de la production et utiliser ses propres identifiants, clés, certificats, URLs et règles de données.

### 3.3 Production

L’accès production nécessite une validation explicite de l’organisation, du produit, des scopes et des contraintes réglementaires applicables.

## 4. Portail développeur

Le portail développeur doit permettre de :

- créer une application partenaire ;
- choisir l’environnement ;
- consulter les scopes disponibles ;
- générer et révoquer des identifiants ;
- gérer des URLs de webhook ;
- consulter les livraisons de webhook ;
- relancer une livraison ;
- consulter la documentation ;
- explorer les endpoints ;
- générer des exemples de requêtes ;
- consulter l’historique d’usage ;
- consulter les limites de débit ;
- télécharger des certificats publics si nécessaires ;
- demander un accès production ;
- voir les incidents et maintenances ;
- gérer les membres techniques de l’organisation.

Le portail doit être accessible selon RBAC. Un développeur ne doit pas automatiquement avoir les droits d’administrateur financier.

## 5. Modèle d’application partenaire

Entité recommandée :

```text
DeveloperApplication
```

Champs minimaux :

- id ;
- organizationId ;
- name ;
- description ;
- environment ;
- status ;
- clientId ;
- authenticationMode ;
- allowedScopes ;
- allowedOrigins si applicable ;
- allowedRedirectUris si OAuth ;
- webhookPolicyId ;
- createdAt ;
- createdBy ;
- suspendedAt ;
- revokedAt ;
- metadata contrôlée.

Statuts possibles :

```text
DRAFT
ACTIVE
SUSPENDED
REVOKED
PENDING_PRODUCTION_APPROVAL
```

## 6. Authentification machine-à-machine

Pour les intégrations serveur à serveur, Mansa doit supporter un mécanisme de type client credentials ou équivalent.

Exigences :

- identifiant client public ;
- secret client à forte entropie ;
- secret affiché une seule fois ;
- stockage uniquement sous forme protégée ;
- rotation sans interruption ;
- possibilité de conserver temporairement deux secrets actifs pendant une rotation ;
- date de création ;
- date de dernière utilisation ;
- révocation immédiate ;
- audit de chaque création, rotation et révocation.

Les secrets ne doivent jamais être placés dans une application mobile publique.

## 7. OAuth pour accès délégué

Lorsque l’intégration agit au nom d’un utilisateur ou d’une organisation, OAuth 2.1 ou un mécanisme équivalent moderne doit être privilégié.

Exigences recommandées :

- authorization code ;
- PKCE pour clients publics ;
- redirect URI strictement enregistrée ;
- state anti-CSRF ;
- consentement visible ;
- scopes explicites ;
- durée de vie courte des access tokens ;
- refresh token rotatif si nécessaire ;
- révocation ;
- journalisation des consentements.

Le mot de passe Mansa de l’utilisateur ne doit jamais être transmis au partenaire.

## 8. Scopes

Les scopes doivent être fins et compréhensibles.

Exemples :

```text
payments.read
payments.create
payments.refund
wallets.read
wallets.transfer
customers.read
customers.write
merchant.orders.read
merchant.orders.write
invoices.read
invoices.write
public-sector.payments.read
mobility.tolls.read
notifications.send
webhooks.manage
reports.read
```

Un scope sensible peut nécessiter une validation renforcée.

Les scopes globaux illimités sont interdits par défaut.

## 9. Autorisation côté serveur

Chaque requête doit vérifier :

```text
token valide
→ application active
→ organisation active
→ environnement correspondant
→ scope requis
→ ressource appartenant au tenant
→ règle métier
→ limite de débit
→ politique de risque éventuelle
```

La présence d’un token valide ne suffit jamais à autoriser une opération.

## 10. Versionnement des API

Les API publiques doivent être versionnées.

Exemple :

```text
/api/v1/payments
/api/v1/wallets
/api/v1/invoices
```

Une rupture de contrat nécessite une nouvelle version majeure ou une stratégie de compatibilité explicite.

Les champs ajoutés de manière rétrocompatible ne doivent pas casser les clients qui ignorent les champs inconnus.

## 11. Contrats de réponse

Réponse standard recommandée :

```json
{
  "data": {},
  "requestId": "req_..."
}
```

Erreur standard recommandée :

```json
{
  "error": {
    "code": "PAYMENT_NOT_ALLOWED",
    "message": "Operation not allowed",
    "requestId": "req_..."
  }
}
```

Le message utilisateur et le détail interne doivent rester séparés.

## 12. Identifiants publics

Les identifiants exposés aux partenaires doivent être non prédictibles.

Exemples :

```text
pay_...
wal_...
inv_...
ord_...
ref_...
app_...
wh_...
```

Aucune séquence numérique simple ne doit permettre d’énumérer les ressources d’un autre tenant.

## 13. Idempotence

Toute création financière ou opération pouvant être rejouée doit supporter une clé d’idempotence.

Exemple d’en-tête :

```text
Idempotency-Key: <valeur unique partenaire>
```

Règles :

- la clé est liée au client, au tenant et à l’opération ;
- une même clé avec le même payload retourne le résultat initial ;
- une même clé avec un payload différent produit une erreur ;
- la durée de conservation est documentée ;
- les retries réseau ne doivent jamais créer de double débit.

## 14. Pagination

Les listes doivent supporter une pagination stable.

La pagination par curseur est recommandée pour les gros volumes.

Exemple :

```text
limit=50
cursor=...
```

Les limites maximales sont documentées.

## 15. Filtres et recherche

Les filtres doivent être explicitement autorisés.

Éviter toute construction SQL libre ou filtre transmis directement à la base.

Les champs filtrables et triables sont listés dans le contrat API.

## 16. Rate limiting

Chaque API doit avoir des limites de débit configurables.

Dimensions possibles :

- application ;
- organisation ;
- adresse IP ;
- endpoint ;
- scope ;
- environnement.

Les réponses doivent indiquer clairement les erreurs de quota sans révéler les mécanismes internes de défense.

Un partenaire ne doit pas pouvoir dégrader la plateforme pour les autres tenants.

## 17. Webhooks

Les webhooks servent à informer les partenaires d’un changement asynchrone.

Exemples :

```text
payment.created
payment.authorized
payment.succeeded
payment.failed
payment.refunded
wallet.transfer.completed
invoice.paid
order.updated
kyc.status.changed
toll.passage.recorded
subscription.updated
```

Les événements disponibles dépendent des produits et scopes activés.

## 18. Structure d’un événement webhook

Structure recommandée :

```json
{
  "id": "evt_...",
  "type": "payment.succeeded",
  "createdAt": "2026-08-09T12:00:00Z",
  "environment": "production",
  "data": {},
  "attempt": 1
}
```

Chaque événement possède un identifiant unique et stable.

## 19. Signature des webhooks

Chaque livraison doit être signée.

Exigences :

- secret webhook propre à l’application ou endpoint ;
- HMAC avec algorithme moderne ou signature asymétrique selon besoin ;
- timestamp signé ;
- protection anti-replay ;
- comparaison constante ;
- rotation de secret ;
- documentation exacte du format canonique signé.

Un partenaire doit pouvoir vérifier la signature avant de traiter le payload.

## 20. Livraison et retries

Un webhook est considéré livré uniquement après une réponse HTTP valide documentée.

Politique recommandée :

```text
attempt 1 : immédiat
attempt 2 : délai court
attempt 3+ : backoff exponentiel
```

Les retries doivent avoir une limite et un délai maximal.

Les événements ne doivent pas être supprimés silencieusement après échec.

## 21. Ordre des événements

Le système ne doit pas garantir un ordre global si l’architecture distribuée ne le permet pas.

Chaque ressource doit fournir suffisamment d’information pour que le partenaire reconstruise son état.

Le partenaire doit traiter les événements de manière idempotente.

## 22. Dead-letter et incidents

Après épuisement des retries :

- la livraison passe en échec final ;
- elle reste consultable dans le portail ;
- le partenaire peut la relancer ;
- Mansa conserve les métadonnées nécessaires à l’audit ;
- les alertes peuvent être déclenchées selon criticité.

## 23. Endpoint webhook

Chaque endpoint doit enregistrer :

- URL HTTPS ;
- événements abonnés ;
- statut ;
- secret actif ;
- secret précédent pendant rotation éventuelle ;
- date de création ;
- date de dernière livraison réussie ;
- taux d’échec ;
- environnement.

HTTP non chiffré est interdit en production sauf environnement privé explicitement contrôlé et documenté.

## 24. Test de webhook

Le portail doit permettre d’envoyer un événement de test.

Le test doit être clairement marqué comme sandbox/test et ne jamais être confondu avec une transaction financière réelle.

## 25. Rejeu manuel

Un utilisateur autorisé peut relancer un événement historique.

Le rejeu doit :

- conserver l’id de l’événement original ou le référencer ;
- créer une nouvelle tentative de livraison ;
- rester auditable ;
- ne pas recréer l’opération métier elle-même.

## 26. Journaux développeur

Le portail peut afficher :

- requestId ;
- endpoint ;
- méthode ;
- code HTTP ;
- durée ;
- date ;
- environnement ;
- application ;
- statut webhook.

Les corps sensibles, secrets, PIN, données carte complètes et tokens ne doivent jamais apparaître dans les logs du portail.

## 27. OpenAPI

Chaque API publique doit disposer d’une spécification OpenAPI maintenue.

La spécification doit décrire :

- endpoints ;
- paramètres ;
- corps de requête ;
- réponses ;
- erreurs ;
- scopes ;
- exemples ;
- idempotence ;
- pagination ;
- limites connues.

Le code livré et la spécification doivent rester synchronisés.

## 28. SDK

Mansa peut fournir des SDK officiels, sans rendre l’API dépendante d’un langage.

Priorités possibles :

```text
TypeScript / JavaScript
Java / Kotlin
Swift
Python
PHP
```

Les SDK doivent rester fins, versionnés et testés.

## 29. Collections et exemples

Le portail peut fournir :

- exemples cURL ;
- collections Postman/Bruno équivalentes ;
- snippets TypeScript ;
- snippets Python ;
- exemples de validation de signature webhook.

Tous les exemples utilisent uniquement des secrets fictifs.

## 30. CORS

Les API serveur à serveur ne doivent pas dépendre de CORS.

Pour les usages navigateur explicitement autorisés :

- origins strictement enregistrées ;
- pas de wildcard avec credentials ;
- méthodes et headers minimaux ;
- aucune clé secrète dans le navigateur.

## 31. Sécurité des clés

Les partenaires doivent être encouragés à conserver les secrets dans :

- gestionnaire de secrets ;
- variable d’environnement sécurisée ;
- coffre de secrets cloud ;
- HSM/KMS si nécessaire.

Le dépôt Git, le code mobile et les fichiers publics sont interdits pour les secrets réels.

## 32. Rotation de clés

Workflow recommandé :

```text
création nouveau secret
→ activation parallèle temporaire
→ migration partenaire
→ vérification utilisation nouveau secret
→ révocation ancien secret
```

La rotation doit être possible sans indisponibilité.

## 33. Révocation d’urgence

En cas de compromission :

- révocation immédiate ;
- invalidation des tokens dérivés si nécessaire ;
- audit ;
- notification aux responsables autorisés ;
- génération d’un nouveau secret ;
- investigation sur les appels réalisés avec l’identifiant compromis.

## 34. Restriction réseau optionnelle

Pour certains partenaires sensibles, Mansa peut proposer :

- allowlist IP ;
- mTLS ;
- VPN privé ;
- PrivateLink ou équivalent ;
- certificats clients.

Ces contrôles complètent l’authentification, ils ne la remplacent pas.

## 35. mTLS

Pour les intégrations bancaires, gouvernementales ou critiques, le mTLS peut être activé.

Le système doit gérer :

- certificat client ;
- autorité de confiance ;
- date d’expiration ;
- rotation ;
- révocation ;
- association certificat/application ;
- audit des changements.

## 36. Produits exposables

La plateforme doit être modulaire.

Exemples de familles API :

```text
Identity API
Payments API
Wallet API
Cards API
Merchant API
Orders API
Invoices API
Notifications API
Public Sector API
Mobility API
Toll API
Reports API
Jini Voice API
```

Une application ne voit que les familles autorisées.

## 37. API paiements

Fonctions possibles selon contrat :

- création d’intention de paiement ;
- consultation ;
- annulation si autorisée ;
- remboursement ;
- statut ;
- reçu ;
- métadonnées métier contrôlées.

Le partenaire ne doit jamais pouvoir imposer arbitrairement un statut `SUCCEEDED`.

## 38. API wallet

Les soldes doivent être retournés depuis le ledger/source de vérité autorisée.

Toute mutation financière doit respecter :

- idempotence ;
- autorisation ;
- limites ;
- contrôle de risque ;
- journalisation ;
- cohérence ledger.

## 39. API secteur public

Les API État doivent conserver les mêmes exigences de sécurité que les autres API et ajouter, selon le service :

- identité de l’administration ;
- rôle de l’agent ;
- habilitation ;
- traçabilité ;
- séparation des tâches ;
- audit ;
- rapprochement financier.

Une administration ne doit pas pouvoir accéder aux données d’une autre administration sans délégation explicite.

## 40. API péage et mobilité

Les intégrations péage doivent respecter les décisions de référence Mansa :

- coexistence du péage automatique classique avec barrière et du télépéage RFID avec barrière ;
- évolution optionnelle future vers free-flow sans supprimer les deux solutions initiales ;
- péage classique compatible, selon activation, avec billets et pièces FCFA, carte EMV multi-réseaux, NFC, carte Mansa, wallet Mansa, QR et Mobile Money ;
- Mobile Money configurable par niveau national, réseau, poste ou voie avec date d’effet et audit ;
- télépéage initial basé sur tags UHF RFID passifs associés au véhicule et au compte ;
- lecteur/antenne, contrôleur local, relais OPEN, barrière et capteurs de passage ;
- fonctionnement local/hors ligne sécurisé avec resynchronisation et absence de double débit ;
- terminaux carte limités aux réseaux activés par l’acquéreur, notamment Visa et Mastercard lorsqu’ils sont contractuellement disponibles ;
- matériel multi-fournisseurs derrière des adaptateurs ;
- trois niveaux d’équipement : automatique complet, semi-automatique, poste numérisé faible coût ;
- déploiement progressif ;
- achat matériel direct par État/concessionnaire ou fourniture/intégration/revente par Mansa ;
- marque blanche État/concessionnaire sur bornes, tags, écrans, reçus et signalétique, avec `Propulsé par Mansa` facultatif ;
- rapprochement anti-corruption véhicule, catégorie, tarif, paiement, ouverture et passage ;
- toute ouverture manuelle auditée.

Une API ne doit pas permettre de déclencher une ouverture de barrière sans authentification forte, autorisation explicite, contexte de voie et audit.

## 41. Webhooks secteur public et péage

Exemples :

```text
toll.vehicle.detected
toll.payment.succeeded
toll.barrier.opened
toll.vehicle.passed
toll.manual_override.created
public-sector.payment.received
public-sector.reconciliation.updated
```

Les événements sensibles peuvent être réservés à des intégrations approuvées.

## 42. Données personnelles

Les API doivent appliquer la minimisation des données.

Un partenaire ne reçoit que les champs nécessaires à son cas d’usage et à ses scopes.

Les champs sensibles peuvent être :

- masqués ;
- tokenisés ;
- omis ;
- accessibles uniquement avec scope dédié.

## 43. Données carte

Les API Mansa ne doivent pas exposer les données carte complètes lorsque cela n’est pas indispensable.

Le stockage CVV est interdit.

La tokenisation doit être privilégiée.

Les exigences PCI DSS applicables restent indépendantes de ce document.

## 44. Audit

Événements minimum à auditer :

- création application ;
- changement de scopes ;
- génération clé ;
- rotation ;
- révocation ;
- création webhook ;
- changement URL ;
- rejeu webhook ;
- approbation production ;
- suspension ;
- modification allowlist ;
- changement certificat.

## 45. Administration interne

L’administration Mansa doit pouvoir :

- rechercher une application ;
- suspendre ;
- révoquer ;
- modifier les produits autorisés ;
- consulter les erreurs ;
- consulter les statistiques ;
- imposer une rotation ;
- désactiver un endpoint webhook ;
- réduire les quotas ;
- bloquer temporairement une intégration en cas d’incident.

Toute action administrative sensible est auditée.

## 46. Quotas commerciaux

Les quotas peuvent dépendre du contrat.

Exemples :

- appels/minute ;
- appels/jour ;
- nombre d’applications ;
- nombre de webhooks ;
- rétention logs ;
- accès sandbox avancé ;
- SLA support.

La logique commerciale ne doit pas affaiblir les protections de sécurité.

## 47. SLA et disponibilité

Pour les partenaires professionnels, les API critiques doivent avoir des objectifs de disponibilité, de latence et de récupération définis.

Les maintenances planifiées et incidents majeurs doivent être publiés via un canal de statut approprié.

## 48. Dépréciation

Toute dépréciation d’API doit prévoir :

- annonce ;
- date de dépréciation ;
- date de fin de support ;
- guide de migration ;
- métriques d’usage ;
- relance des partenaires encore actifs.

Une API critique ne doit pas être supprimée brutalement sans procédure exceptionnelle documentée.

## 49. Tests obligatoires

La plateforme doit disposer au minimum de tests pour :

- token expiré ;
- token révoqué ;
- mauvais scope ;
- mauvais tenant ;
- mauvais environnement ;
- ressource inexistante ;
- idempotence ;
- payload différent avec même clé ;
- pagination ;
- rate limit ;
- webhook signature valide ;
- signature invalide ;
- timestamp trop ancien ;
- replay ;
- retry ;
- dead-letter ;
- rotation de secret ;
- révocation ;
- mTLS si activé.

## 50. Tests multi-tenant

Des tests négatifs doivent vérifier explicitement :

```text
organisation A ne lit pas organisation B
organisation A ne modifie pas organisation B
application sandbox ne touche pas production
application sans scope ne reçoit pas la ressource
clé révoquée ne fonctionne plus
```

## 51. Observabilité

Métriques recommandées :

- requêtes par endpoint ;
- latence p50/p95/p99 ;
- erreurs 4xx/5xx ;
- taux de throttling ;
- appels par application ;
- erreurs d’authentification ;
- webhooks livrés ;
- webhooks échoués ;
- temps moyen de livraison ;
- profondeur de retry ;
- anomalies de trafic.

## 52. Détection d’abus

La plateforme doit pouvoir détecter :

- scan d’identifiants ;
- augmentation brutale de trafic ;
- erreurs répétitives ;
- appels depuis zones inattendues ;
- usage d’une clé après rotation ;
- énumération de ressources ;
- abus de remboursement ;
- appels automatiques anormaux.

Les réponses peuvent inclure réduction de quota, challenge, suspension ou révocation selon politique.

## 53. Documentation d’intégration

Chaque produit exposé doit documenter :

- prérequis ;
- authentification ;
- scopes ;
- flux principal ;
- erreurs ;
- webhooks ;
- idempotence ;
- exemples ;
- sandbox ;
- passage production ;
- support.

## 54. Processus d’onboarding partenaire

Flux recommandé :

```text
création organisation
→ création application sandbox
→ développement
→ tests automatisés
→ validation sécurité
→ validation métier/réglementaire
→ activation production
→ supervision
```

## 55. Certification d’intégration

Pour les intégrations sensibles, Mansa peut exiger une recette de certification avant production.

Critères possibles :

- gestion correcte retries ;
- idempotence ;
- validation webhook ;
- gestion expiration tokens ;
- absence de secrets côté client ;
- gestion des erreurs ;
- réconciliation ;
- scénario de panne.

## 56. Support développeur

Le support doit pouvoir travailler à partir d’un `requestId` sans demander au partenaire de transmettre des secrets.

Les tickets techniques doivent permettre de joindre :

- requestId ;
- timestamp ;
- environnement ;
- endpoint ;
- code erreur ;
- description.

## 57. Interdictions

Il est interdit de :

- partager une clé production entre plusieurs organisations ;
- stocker un secret dans Git ;
- contourner la passerelle API ;
- accepter un webhook sans signature lorsque la signature est requise ;
- utiliser une clé sandbox en production ;
- exposer une API interne non revue comme API publique ;
- faire confiance à un identifiant de tenant fourni par le client sans validation serveur ;
- désactiver les contrôles d’autorisation pour résoudre un problème d’intégration.

## 58. Modèle de données minimal

Entités recommandées :

```text
DeveloperApplication
ApiCredential
ApiScope
ApplicationScope
OAuthClient
OAuthConsent
WebhookEndpoint
WebhookSecret
WebhookEvent
WebhookDelivery
ApiRequestLog
RateLimitPolicy
IpAllowlistEntry
ClientCertificate
DeveloperAuditLog
ProductionAccessRequest
```

## 59. Critères d’acceptation

Le module est considéré prêt lorsque :

- sandbox, recette et production sont isolés ;
- les applications sont rattachées à un tenant ;
- clés et OAuth sont gérés sans secret exposé ;
- scopes et autorisations sont appliqués côté serveur ;
- idempotence est disponible sur opérations financières ;
- webhooks sont signés et rejouables ;
- retries et dead-letter sont opérationnels ;
- OpenAPI est publié ;
- logs et métriques sont disponibles ;
- tests multi-tenant sont verts ;
- rotation/révocation fonctionnent ;
- aucune donnée sensible interdite n’apparaît dans les logs ;
- le passage production nécessite une approbation explicite.

## 60. Principe final

La plateforme développeur Mansa doit rendre les intégrations simples sans rendre la plateforme permissive. La sécurité, l’isolation multi-tenant, l’idempotence, la traçabilité et la révocation priment sur la facilité d’intégration lorsque les deux entrent en conflit.
