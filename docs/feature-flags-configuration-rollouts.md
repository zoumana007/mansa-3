# Feature flags, configuration distante et déploiements progressifs

## 1. Objet

Ce document définit le cahier des charges Mansa pour la gestion centralisée des feature flags, paramètres fonctionnels, kill switches, configurations par pays/organisation/site/appareil et déploiements progressifs.

Le domaine permet d'activer, désactiver ou faire évoluer des fonctionnalités sans redéployer tout le système, tout en conservant une gouvernance stricte, une traçabilité complète et des mécanismes de repli sûrs.

Il s'applique aux applications client, commerçant, TPE, Admin Lite, portails web, API, services backend, bornes, dispositifs de péage, modules État, Jini Voice et intégrations partenaires.

## 2. Principes de référence

Principes obligatoires :

- aucune règle de sécurité critique ne doit dépendre uniquement d'un flag côté client ;
- les paramètres appliqués côté serveur font autorité ;
- chaque changement est versionné, daté, attribué à un auteur et audité ;
- un changement sensible doit pouvoir exiger une double validation ;
- toute configuration peut posséder une date d'effet et une date d'expiration ;
- les rollouts doivent être progressifs et réversibles ;
- les valeurs par défaut doivent être sûres ;
- l'absence de service de configuration ne doit pas provoquer l'activation accidentelle d'une fonction sensible ;
- les appareils hors ligne utilisent une configuration mise en cache, signée ou protégée contre altération ;
- la configuration multi-tenant est strictement isolée ;
- aucun secret réel n'est stocké dans les feature flags ;
- les décisions réglementaires, pays, KYC, AML/CFT, paiements et droits d'accès restent prioritaires sur les flags produit.

## 3. Périmètre

Le domaine couvre :

```text
Feature flags
Remote configuration
Kill switches
Rollouts progressifs
Expérimentations contrôlées
Configuration par pays
Configuration par organisation
Configuration par site et terminal
Configuration par rôle
Configuration par canal
Planification d'activation
Versionnement
Audit
Validation à plusieurs niveaux
Cache hors ligne
Rollback
Observabilité
API d'administration
SDK internes
```

## 4. Types de configuration

Types recommandés :

```text
BOOLEAN
STRING
INTEGER
DECIMAL
ENUM
JSON_SCHEMA_VALIDATED
PERCENTAGE
DURATION
THRESHOLD
POLICY_REFERENCE
```

Les valeurs structurées doivent être validées par schéma avant publication.

## 5. Entités principales

Entités recommandées :

```text
ConfigurationKey
ConfigurationVersion
ConfigurationScope
ConfigurationOverride
FeatureFlag
FeatureFlagRule
RolloutPlan
RolloutStage
KillSwitch
ConfigurationApproval
ConfigurationPublication
ConfigurationSnapshot
DeviceConfigurationSnapshot
ConfigurationAuditLog
ConfigurationIncident
```

## 6. Clé de configuration

`ConfigurationKey` contient au minimum :

- key ;
- domaine ;
- description ;
- type ;
- valeur par défaut ;
- classification de sensibilité ;
- schéma de validation éventuel ;
- propriétaire métier ;
- propriétaire technique ;
- environnements autorisés ;
- date de création ;
- statut.

Exemples :

```text
payments.mobile_money.enabled
payments.card.contactless.enabled
cards.virtual.enabled
merchant.offline.max_transaction_amount
state.toll.cash.enabled
state.toll.mobile_money.enabled
state.toll.free_flow.enabled
jini.recording.enabled
security.session.max_duration
```

## 7. Portées

Une valeur peut être définie aux niveaux :

```text
GLOBAL
ENVIRONMENT
COUNTRY
LEGAL_ENTITY
ORGANIZATION
MERCHANT_GROUP
MERCHANT
STATE_AGENCY
NETWORK
SITE
TOLL_PLAZA
LANE
DEVICE_GROUP
DEVICE
APPLICATION
APP_VERSION
USER_SEGMENT
USER
```

La résolution suit une priorité explicite du plus spécifique au plus général.

## 8. Héritage et résolution

Exemple de résolution :

```text
DEVICE
→ LANE
→ TOLL_PLAZA
→ NETWORK
→ ORGANIZATION
→ COUNTRY
→ ENVIRONMENT
→ GLOBAL
→ DEFAULT
```

La valeur effectivement appliquée doit pouvoir être expliquée avec sa source exacte.

## 9. Mobile Money et péages

Pour le domaine péage, `state.toll.mobile_money.enabled` doit rester configurable au minimum aux niveaux :

```text
COUNTRY/NATIONAL
NETWORK
TOLL_PLAZA
LANE
```

Chaque changement enregistre :

- ancienne valeur ;
- nouvelle valeur ;
- auteur ;
- approbateur éventuel ;
- date d'effet ;
- motif ;
- périmètre ;
- identifiant d'audit.

Mobile Money ne doit jamais être supprimé automatiquement du produit lorsqu'il est désactivé : il reste un canal configurable.

## 10. Références péage obligatoires

Le système de configuration doit préserver simultanément :

- solution A : péage automatique classique avec barrière ;
- solution B : télépéage RFID UHF avec barrière ;
- évolution future optionnelle : free-flow sans barrière.

Le free-flow doit être activé par politique explicite et ne remplace jamais automatiquement les deux solutions initiales.

Le péage classique peut activer séparément :

```text
cash_notes
cash_coins
card_emv
card_contactless
mansa_card
mansa_wallet
qr
mobile_money
receipt
```

Les réseaux carte disponibles proviennent de la configuration de l'acquéreur. Le système peut afficher Visa et Mastercard lorsqu'ils sont contractuellement activés, sans prétendre accepter toutes les cartes du monde.

## 11. Feature flags

Un `FeatureFlag` contient :

- key ;
- description ;
- owner ;
- type ;
- defaultValue ;
- environment ;
- status ;
- expiryAt éventuel ;
- createdBy ;
- createdAt.

Statuts :

```text
DRAFT
READY
ACTIVE
PAUSED
RETIRED
```

## 12. Règles d'évaluation

Une règle peut dépendre de :

- pays ;
- tenant ;
- rôle ;
- application ;
- version applicative ;
- type d'appareil ;
- site ;
- canal ;
- segment contrôlé ;
- pourcentage de rollout ;
- période ;
- capacité matérielle.

Les règles ne doivent pas utiliser de données sensibles non nécessaires.

## 13. Rollout progressif

Stages recommandés :

```text
INTERNAL
PILOT
1_PERCENT
5_PERCENT
25_PERCENT
50_PERCENT
100_PERCENT
```

Chaque étape possède :

- population ciblée ;
- durée minimale ;
- métriques de succès ;
- seuils d'erreur ;
- conditions d'arrêt ;
- propriétaire ;
- validation éventuelle.

## 14. Critères de promotion

Un rollout ne passe à l'étape suivante que si les seuils sont respectés.

Exemples :

- taux d'erreur inférieur au seuil ;
- absence d'incident critique ;
- latence acceptable ;
- absence d'écart financier ;
- absence de hausse anormale de fraude ;
- stabilité du taux de paiement réussi ;
- compatibilité matérielle validée.

## 15. Rollback automatique

Le système peut déclencher un rollback si :

```text
error_rate > threshold
payment_failure_rate > threshold
ledger_mismatch_detected = true
fraud_spike = true
latency_p95 > threshold
critical_alert = true
```

Un rollback ne doit jamais supprimer les données déjà créées. Il revient à la dernière configuration connue sûre.

## 16. Kill switches

Les kill switches sont réservés aux fonctions nécessitant une désactivation rapide.

Exemples :

```text
payments.card.enabled
payments.mobile_money.enabled
transfers.international.enabled
cards.virtual.enabled
merchant.offline.enabled
state.toll.cash.enabled
state.toll.rfid.enabled
jini.ai_answering.enabled
```

Un kill switch sensible doit être :

- protégé par RBAC ;
- audité ;
- visible dans le SOC/monitoring ;
- accompagné d'un motif ;
- réversible ;
- testé en préproduction.

## 17. Séparation des responsabilités

Rôles recommandés :

```text
CONFIG_VIEWER
CONFIG_EDITOR
CONFIG_APPROVER
CONFIG_PUBLISHER
CONFIG_AUDITOR
EMERGENCY_OPERATOR
```

Une même personne ne doit pas obligatoirement pouvoir éditer et publier seule les paramètres les plus sensibles.

## 18. Double validation

Peuvent exiger une double validation :

- frais et commissions ;
- limites financières ;
- canaux de paiement nationaux ;
- règles État ;
- péages ;
- permissions privilégiées ;
- journalisation ;
- KYC/AML ;
- conservation des données ;
- sécurité ;
- désactivation de contrôles critiques.

## 19. Planification

Une modification peut être :

```text
IMMEDIATE
SCHEDULED
WINDOWED
EXPIRING
```

Les changements planifiés doivent utiliser l'heure locale pertinente et conserver l'instant UTC de référence.

## 20. Versionnement

Toute publication crée une version immuable contenant :

- snapshot complet ;
- delta ;
- auteur ;
- approbations ;
- date ;
- motif ;
- ticket ou référence métier éventuelle ;
- hash de contenu.

## 21. Snapshots

`ConfigurationSnapshot` permet de reconstruire l'état d'un environnement à une date donnée.

Cas d'usage :

- audit ;
- incident ;
- rollback ;
- reproduction d'un bug ;
- comparaison staging/prod ;
- contrôle réglementaire.

## 22. Cache local et hors ligne

Les TPE, bornes et contrôleurs locaux peuvent conserver un snapshot local.

Le snapshot comprend :

- version ;
- date ;
- périmètre ;
- expiration ;
- signature ou mécanisme d'intégrité ;
- valeurs nécessaires uniquement.

En cas de perte réseau :

```text
utiliser dernier snapshot valide
→ appliquer valeurs sûres expirables
→ journaliser le mode dégradé
→ resynchroniser au retour réseau
```

## 23. Péage hors ligne

Le contrôleur de péage peut conserver localement :

- tarifs ;
- moyens de paiement autorisés ;
- règles minimales ;
- listes d'autorisation/blocage ;
- configuration RFID ;
- paramètres de barrière ;
- seuils de collecte ;
- capacités matérielles.

La reprise réseau doit préserver idempotence, ordre des événements et absence de double débit.

## 24. Capacités matérielles

La configuration ne doit jamais activer une fonction que le matériel ne sait pas exécuter.

Chaque terminal publie ou référence ses capacités :

```text
EMV
NFC
QR_SCANNER
NOTE_ACCEPTOR_XOF
COIN_ACCEPTOR_XOF
CASH_RECYCLER
RECEIPT_PRINTER
RFID_UHF
ANPR
RELAY_OUTPUT
```

Le moteur calcule :

```text
fonction autorisée par politique
AND
fonction disponible sur matériel
AND
fournisseur/acquéreur configuré
```

## 25. Multi-fournisseurs

Le système de configuration pilote des adaptateurs et non des fabricants en dur.

Exemples :

```text
CardTerminalAdapter
CashDeviceAdapter
RfidReaderAdapter
BarrierControllerAdapter
PrinterAdapter
AnprAdapter
```

Les interfaces peuvent être API, SDK, TCP/IP, USB, RS-232, RS-485, relais/contact sec ou interface industrielle documentée.

## 26. Trois niveaux d'équipement péage

Les profils configurables restent :

```text
FULL_AUTOMATIC
SEMI_AUTOMATIC
LOW_COST_DIGITIZED
```

Le déploiement progressif permet à l'État ou au concessionnaire d'équiper les sites par étapes.

## 27. Modèles commerciaux matériel

La configuration doit enregistrer la propriété et la responsabilité du matériel :

```text
CUSTOMER_OWNED
MANSA_SUPPLIED
MANSA_INTEGRATED
MANSA_RESELL
```

Cela ne change pas les règles de sécurité ou de traçabilité.

## 28. Marque blanche

Les paramètres de branding peuvent varier par organisation/site :

- logo ;
- couleurs ;
- nom exploitant ;
- écrans ;
- reçus ;
- tags ;
- signalétique ;
- mention facultative `Propulsé par Mansa`.

Le branding ne doit jamais modifier les règles financières ou de sécurité.

## 29. Anti-corruption péage

Les flags et paramètres ne doivent pas permettre de désactiver silencieusement le rapprochement :

```text
véhicule détecté
→ catégorie
→ tarif attendu
→ paiement
→ autorisation d'ouverture
→ ouverture réelle
→ passage physique
```

Toute ouverture manuelle reste auditée, même si un paramètre opérationnel autorise l'action.

## 30. Expérimentations

Les expériences A/B sont interdites sur les décisions critiques de sécurité, KYC, AML/CFT ou autorisation financière.

Elles peuvent concerner :

- UX ;
- ordre d'affichage ;
- contenu ;
- onboarding ;
- notifications ;
- parcours non critiques.

## 31. API d'évaluation

API interne recommandée :

```text
GET /configuration/snapshot
POST /configuration/evaluate
POST /configuration/changes
POST /configuration/approvals
POST /configuration/publications
POST /configuration/rollback
```

L'évaluation critique doit être disponible côté serveur sans dépendre d'un appel réseau à chaque requête.

## 32. SDK internes

SDK prévus :

```text
@mansapay/config-node
@mansa/config-react-native
@mansa/config-web
@mansa/config-device
```

Chaque SDK implémente :

- cache ;
- résolution ;
- fallback ;
- métriques ;
- version ;
- invalidation ;
- comportement hors ligne.

## 33. Observabilité

Métriques minimales :

- version active ;
- taux d'évaluation ;
- erreurs ;
- cache hit rate ;
- propagation delay ;
- nombre de rollbacks ;
- changements urgents ;
- appareils en configuration obsolète ;
- divergence entre environnements.

## 34. Alertes

Alertes recommandées :

```text
configuration_publish_failed
configuration_propagation_delayed
unknown_configuration_key
invalid_configuration_value
stale_device_snapshot
kill_switch_triggered
unauthorized_change_attempt
rollout_health_degraded
```

## 35. Journal d'audit

Chaque événement enregistre :

- actorId ;
- rôle ;
- tenant ;
- action ;
- clé ;
- ancienne valeur ;
- nouvelle valeur ;
- scope ;
- date ;
- adresse/source technique ;
- approbation ;
- motif ;
- correlationId.

Les journaux sont protégés contre altération conformément aux règles d'audit Mansa.

## 36. Sécurité

Exigences :

- chiffrement en transit ;
- chiffrement au repos selon sensibilité ;
- authentification forte des administrateurs ;
- RBAC ;
- limitation de débit ;
- validation de schéma ;
- interdiction des secrets dans les valeurs ;
- signature/intégrité des snapshots appareils ;
- rotation des clés de signature ;
- séparation dev/staging/prod.

## 37. Tests

Tests obligatoires :

```text
unitaires de résolution
priorité des scopes
validation de types
validation de schéma
RBAC
approbations
publication
rollback
rollout progressif
cache hors ligne
snapshot expiré
signature invalide
multi-tenant
kill switch
configuration péage
configuration Mobile Money
capacité matérielle absente
```

## 38. Tests négatifs

Le système doit vérifier qu'un acteur non autorisé ne peut pas :

- modifier un autre tenant ;
- publier en production ;
- contourner une approbation ;
- activer un moyen de paiement non disponible ;
- modifier rétroactivement l'audit ;
- injecter un secret ;
- forcer un free-flow non autorisé ;
- désactiver l'audit des ouvertures manuelles.

## 39. Déploiement

Ordre recommandé :

```text
modèle de données
→ service de configuration
→ API admin
→ audit
→ cache serveur
→ SDK internes
→ rollouts
→ snapshots appareils
→ kill switches
→ intégration TPE/bornes
→ tableaux de bord
```

## 40. Critères d'acceptation

Le domaine est acceptable lorsque :

- une fonction peut être activée/désactivée sans redéploiement ;
- les valeurs sont correctement isolées par tenant et scope ;
- chaque changement est audité ;
- les changements sensibles nécessitent les approbations prévues ;
- un rollout peut être stoppé et annulé ;
- les appareils hors ligne disposent d'un snapshot sûr ;
- aucun moyen de paiement n'est présenté si non autorisé ou matériellement indisponible ;
- les règles péage de référence restent respectées ;
- la reprise réseau ne provoque pas de double débit ;
- le système peut expliquer la valeur effectivement appliquée.

## 41. Résultat attendu

Le moteur de configuration Mansa doit permettre d'exploiter une plateforme multi-pays et multi-tenant sans transformer chaque changement opérationnel en redéploiement logiciel. La flexibilité reste strictement encadrée par le RBAC, l'audit, les approbations, les capacités matérielles, les règles réglementaires et les mécanismes de rollback.
