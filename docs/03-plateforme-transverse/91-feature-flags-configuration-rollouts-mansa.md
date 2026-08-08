# Mansa — Feature flags, configuration distante, kill switches et déploiements progressifs

## 1. Objet

Ce document définit le système transverse Mansa de gestion des fonctionnalités activables, configurations dynamiques, bascules d’urgence, expérimentations contrôlées et déploiements progressifs.

L’objectif est de permettre à Mansa d’activer, désactiver, limiter ou modifier le comportement d’un service sans devoir redéployer toute la plateforme, tout en conservant sécurité, traçabilité, cohérence multi-tenant et capacité de retour arrière.

Ce moteur est réutilisable par :

- application Client ;
- application Commerçant ;
- application Agent ;
- TPE et terminaux Android ;
- Admin Lite ;
- portail administrateur ;
- portail État ;
- services backend ;
- APIs partenaires ;
- Jini et Jini Voice ;
- services de paiement ;
- cartes ;
- wallets ;
- agents ;
- KYC/KYB ;
- transport ;
- péages ;
- access & mobility ;
- notifications ;
- modules futurs.

## 2. Principes

Le moteur doit respecter les principes suivants :

1. aucune fonctionnalité critique ne doit dépendre d’une valeur codée en dur lorsqu’elle doit pouvoir être suspendue opérationnellement ;
2. toute modification sensible doit être authentifiée, autorisée, horodatée et auditée ;
3. les changements doivent pouvoir être limités par pays, organisation, tenant, produit, canal, site, appareil, version ou population ;
4. un changement ne doit jamais rétroagir silencieusement ;
5. une configuration invalide ne doit pas casser l’application ;
6. le dernier état valide doit rester disponible en cas de perte réseau ;
7. les clients ne doivent jamais pouvoir imposer eux-mêmes une valeur de sécurité ;
8. les bascules financières et de sécurité doivent être appliquées côté serveur ;
9. les valeurs sensibles ne sont jamais utilisées comme mécanisme de stockage de secrets ;
10. les feature flags ne remplacent ni RBAC, ni autorisation, ni contrôle réglementaire.

## 3. Types de configuration

Le système distingue au minimum :

```text
FEATURE_FLAG
REMOTE_CONFIG
KILL_SWITCH
ROLLOUT_POLICY
EXPERIMENT
OPERATIONAL_LIMIT
PROVIDER_ROUTING
MAINTENANCE_SWITCH
REGULATORY_SWITCH
```

### 3.1 FEATURE_FLAG

Active ou désactive une fonctionnalité.

Exemples :

- carte virtuelle ;
- paiement QR ;
- paiement Mobile Money ;
- module crédit ;
- reconnaissance ANPR ;
- traduction Jini ;
- programme de fidélité.

### 3.2 REMOTE_CONFIG

Modifie une valeur opérationnelle sans redéploiement.

Exemples :

- plafond ;
- délai ;
- nombre de tentatives ;
- durée de cache ;
- taille maximale de fichier ;
- message utilisateur ;
- ordre de priorité de providers.

### 3.3 KILL_SWITCH

Coupe immédiatement une fonction risquée ou défaillante.

Exemples :

- suspendre un rail de paiement ;
- suspendre un fournisseur compromis ;
- désactiver les retraits ;
- bloquer l’émission de cartes ;
- couper un endpoint partenaire ;
- désactiver une voie ou un type de paiement péage.

Un kill switch doit être conçu à l’avance. Il ne doit pas nécessiter une modification de code en pleine crise.

## 4. Niveaux de portée

Une règle peut s’appliquer aux niveaux suivants :

```text
GLOBAL
REGION
COUNTRY
LEGAL_ENTITY
ORGANIZATION
TENANT
PRODUCT
SERVICE
CHANNEL
APP
APP_VERSION
DEVICE_TYPE
PARTNER
PROVIDER
SITE
TOLL_NETWORK
TOLL_PLAZA
TOLL_LANE
USER_SEGMENT
USER
```

Les portées les plus spécifiques peuvent surcharger les portées générales uniquement selon une hiérarchie explicitement définie.

## 5. Priorité des règles

Exemple de priorité :

```text
USER / DEVICE
> SITE / LANE / PARTNER
> ORGANIZATION / TENANT
> COUNTRY
> GLOBAL
> DEFAULT_CODE
```

La résolution doit être déterministe.

Pour chaque valeur finale, le moteur doit pouvoir expliquer :

- quelle règle a gagné ;
- quelle portée l’a définie ;
- depuis quand ;
- par qui ;
- quelle version de règle est appliquée.

## 6. Valeurs par défaut sûres

Chaque flag ou configuration doit posséder une valeur par défaut sûre définie dans le code.

Si le service de configuration est inaccessible :

- les fonctions financières critiques utilisent un comportement conservateur ;
- les fonctions facultatives peuvent être désactivées ;
- les clients utilisent la dernière configuration valide non expirée lorsque cela est autorisé ;
- aucune permission supplémentaire ne doit être accordée par défaut.

Principe : `fail closed` pour sécurité/autorisation, comportement explicite pour disponibilité métier.

## 7. Modèle de données

Entités recommandées :

```text
ConfigurationKey
ConfigurationValue
ConfigurationScope
ConfigurationVersion
FeatureFlag
FlagRule
Rollout
Experiment
KillSwitch
ConfigurationChangeRequest
ConfigurationApproval
ConfigurationAuditEvent
ConfigurationSnapshot
ClientConfigurationBundle
```

Champs minimaux d’une clé :

- code stable ;
- nom ;
- description ;
- type ;
- valeur par défaut ;
- schéma de validation ;
- criticité ;
- propriétaire métier ;
- propriétaire technique ;
- scopes autorisés ;
- environnements autorisés ;
- statut ;
- date de création ;
- date de dépréciation éventuelle.

## 8. Types de valeur

Types supportés :

```text
BOOLEAN
STRING
INTEGER
DECIMAL
ENUM
JSON
DURATION
PERCENTAGE
MONEY
COUNTRY_LIST
PROVIDER_LIST
```

Chaque type doit être validé strictement.

Un schéma JSON ou validation équivalente doit être utilisé pour les objets complexes.

## 9. Environnements

Les configurations sont séparées entre :

```text
LOCAL
DEVELOPMENT
TEST
STAGING
PREPROD
PRODUCTION
```

Une configuration de test ne doit jamais être promue silencieusement en production.

La promotion doit être explicite et auditée.

## 10. Portail d’administration

Menu recommandé :

```text
Configuration
├── Feature flags
├── Paramètres distants
├── Kill switches
├── Déploiements progressifs
├── Expérimentations
├── Providers
├── Historique
├── Approbations
└── Audit
```

Pour chaque clé, le portail affiche :

- valeur actuelle ;
- valeur par défaut ;
- portée ;
- environnement ;
- date d’effet ;
- auteur ;
- justification ;
- dernière modification ;
- historique ;
- impact estimé ;
- dépendances ;
- statut de synchronisation.

## 11. RBAC et séparation des tâches

Permissions recommandées :

```text
config.read
config.create
config.update
config.publish
config.rollback
config.kill_switch
config.approve
config.audit.read
experiment.manage
rollout.manage
```

Les changements sensibles peuvent exiger un principe maker-checker :

1. une personne propose ;
2. une autre approuve ;
3. le système publie.

Les rôles pouvant déclencher un kill switch doivent être fortement limités.

## 12. Classification de criticité

Chaque configuration est classée :

```text
LOW
MEDIUM
HIGH
CRITICAL
```

Exemples CRITICAL :

- retraits ;
- transferts ;
- plafonds financiers ;
- routage acquéreur ;
- émission de carte ;
- Mobile Money national ;
- règles d’accès État ;
- ouverture automatique de barrières ;
- règles antifraude sensibles.

Les valeurs CRITICAL nécessitent des protections renforcées.

## 13. Workflow de modification

Cycle recommandé :

```text
DRAFT
→ PENDING_APPROVAL
→ APPROVED
→ SCHEDULED
→ ACTIVE
→ SUPERSEDED
```

États complémentaires :

```text
REJECTED
CANCELLED
ROLLED_BACK
EXPIRED
```

Chaque changement inclut :

- ancienne valeur ;
- nouvelle valeur ;
- motif ;
- auteur ;
- approbateur ;
- date d’effet ;
- date d’expiration éventuelle ;
- ticket ou incident associé ;
- plan de rollback.

## 14. Date d’effet

Une configuration peut être :

- immédiate ;
- planifiée ;
- temporaire ;
- limitée à une fenêtre horaire ;
- limitée à une campagne ;
- automatiquement expirante.

Une valeur temporaire doit pouvoir revenir automatiquement à l’état précédent.

## 15. Rollback

Toute modification doit pouvoir être annulée vers une version antérieure valide.

Le rollback :

- crée une nouvelle version ;
- ne supprime pas l’historique ;
- conserve le lien avec l’incident ;
- est lui-même audité.

## 16. Déploiements progressifs

Une fonctionnalité peut être déployée progressivement :

```text
0%
1%
5%
10%
25%
50%
100%
```

Ciblage possible :

- utilisateurs internes ;
- beta testers ;
- un pays ;
- une ville ;
- une organisation ;
- un marchand ;
- une version d’application ;
- une catégorie de TPE ;
- un partenaire ;
- un site de péage.

## 17. Bucketing stable

Lors d’un rollout en pourcentage, un utilisateur ou appareil doit rester dans le même groupe tant que la clé et le seed ne changent pas.

Méthode recommandée : hash stable de :

```text
flagKey + subjectId + rolloutSeed
```

Le bucketing ne doit pas reposer sur `Math.random()` à chaque requête.

## 18. Canary release

Pour un backend ou provider :

1. trafic interne ;
2. 1 % ;
3. 5 % ;
4. 25 % ;
5. 50 % ;
6. 100 %.

À chaque étape, contrôler :

- taux d’erreur ;
- latence ;
- transactions échouées ;
- anomalies antifraude ;
- réclamations ;
- charge ;
- métriques métier.

Le rollout peut se suspendre automatiquement si les seuils sont dépassés.

## 19. Kill switch opérationnel

Un kill switch doit permettre de désactiver une fonction avec très peu d’actions.

Il doit inclure :

- confirmation explicite ;
- niveau impacté ;
- motif obligatoire ;
- durée éventuelle ;
- identifiant incident ;
- notification des équipes ;
- journal d’audit ;
- écran d’état.

Le système doit éviter les doubles clics ou déclenchements concurrents.

## 20. Cas paiements

Exemples :

```text
payments.card.enabled
payments.qr.enabled
payments.mobile_money.enabled
payments.cash.enabled
payments.provider.orange.enabled
payments.provider.visa.enabled
payments.refund.enabled
payments.withdrawal.enabled
```

Une désactivation d’un provider ne doit pas nécessairement désactiver les autres.

Le moteur de paiement doit rerouter uniquement vers les providers autorisés et sains.

## 21. Cas Mobile Money

Mobile Money est un canal configurable et ne doit jamais être supprimé automatiquement du produit.

Pour les usages État/péage, l’administration doit pouvoir l’activer ou le désactiver aux niveaux :

```text
NATIONAL
NETWORK
TOLL_PLAZA
TOLL_LANE
```

Chaque changement enregistre :

- ancienne valeur ;
- nouvelle valeur ;
- auteur ;
- date d’effet ;
- motif ;
- portée ;
- audit.

## 22. Exigences de référence péage

Le moteur de configuration doit préserver explicitement les architectures de référence suivantes :

- solution A : péage automatique classique avec barrière ;
- solution B : télépéage RFID UHF passif avec barrière ;
- évolution future optionnelle : free-flow sans barrière, sans remplacer les deux solutions initiales.

Le péage classique peut accepter selon les canaux activés :

- billets FCFA/XOF ;
- pièces FCFA/XOF ;
- carte bancaire EMV ;
- réseaux activés par l’acquéreur, notamment Visa et Mastercard lorsqu’ils sont contractuellement disponibles ;
- NFC ;
- carte Mansa ;
- wallet Mansa ;
- QR ;
- Mobile Money.

La configuration ne doit jamais prétendre garantir toutes les cartes du monde.

## 23. Télépéage RFID

Le télépéage initial repose sur :

```text
tag UHF RFID passif
→ véhicule
→ compte/abonnement
→ lecteur/antenne
→ contrôleur local
→ relais OPEN
→ barrière
→ capteurs de passage
```

Des flags peuvent contrôler :

- activation RFID ;
- politique RFID + plaque ;
- mode hors ligne ;
- niveau de cache local ;
- plafonds ;
- fallback vers borne classique.

Un flag ne doit jamais permettre de contourner silencieusement les contrôles antifraude obligatoires.

## 24. Mode hors ligne péage

Le fonctionnement local sécurisé reste obligatoire.

Le contrôleur de voie conserve un snapshot signé ou protégé contenant uniquement les paramètres nécessaires :

- tarifs ;
- moyens de paiement autorisés ;
- règles minimales RFID ;
- listes de blocage ;
- seuils ;
- version de configuration.

Au retour du réseau :

- resynchronisation ;
- déduplication ;
- aucune double facturation ;
- remontée des événements ;
- comparaison des versions.

## 25. Matériel multi-fournisseurs

Les flags ne doivent jamais dépendre d’une marque de borne.

La configuration cible les capacités abstraites :

```text
CASH_BILL
CASH_COIN
CHANGE_BILL
CHANGE_COIN
CARD_EMV
NFC
QR
RFID
ANPR
PRINTER
INTERCOM
BARRIER
```

Les drivers/adaptateurs traduisent ensuite vers le matériel réel via API, SDK, TCP/IP, USB, RS-232, RS-485, MDB, Pulse, GPIO, relais/contact sec ou interface industrielle documentée.

## 26. Trois niveaux d’équipement péage

La configuration doit supporter simultanément :

### Voie automatique complète

- borne ;
- espèces automatisées ;
- rendu de monnaie ;
- TPE ;
- QR ;
- contrôleur ;
- barrière ;
- capteurs.

### Voie semi-automatique

- agent ;
- terminal ;
- caisse sécurisée ;
- paiement assisté ;
- ouverture auditée.

### Poste numérisé à faible coût

- matériel existant conservé ;
- tablette/app Mansa ;
- numérisation progressive ;
- perception physique éventuellement maintenue.

L’État n’est pas obligé d’équiper tous les péages immédiatement.

## 27. Modèles commerciaux matériel

Le système doit rester compatible avec :

1. matériel acheté directement par l’État ou le concessionnaire ;
2. matériel fourni, intégré ou revendu par Mansa.

Aucun flag ne doit verrouiller artificiellement le client sur un fabricant unique.

## 28. Marque blanche

Les configurations peuvent contrôler :

- logo ;
- couleurs ;
- messages ;
- écrans ;
- reçus ;
- tags ;
- signalétique ;
- nom du service.

Les portails État/concessionnaire peuvent être en marque blanche.

La mention `Propulsé par Mansa` reste facultative selon contrat/configuration.

## 29. Anti-corruption péage

Aucune configuration ne doit désactiver silencieusement l’audit du parcours :

```text
véhicule détecté
→ catégorie
→ tarif attendu
→ paiement
→ autorisation
→ ouverture de barrière
→ passage physique
```

Toute ouverture manuelle reste auditée.

Si une exception opérationnelle est activée par configuration, elle doit comporter :

- portée ;
- durée ;
- auteur ;
- approbation ;
- motif ;
- journalisation ;
- alerte éventuelle.

## 30. Cas cartes

Exemples :

```text
cards.virtual.enabled
cards.physical.enabled
cards.disposable.enabled
cards.contactless.enabled
cards.freeze.enabled
cards.country.<code>.enabled
```

Une désactivation de fonctionnalité ne doit pas modifier les droits réseau déjà émis sans procédure explicite avec le processeur/émetteur.

## 31. Cas agent

Configurations possibles :

- dépôt cash ;
- retrait cash ;
- commissions ;
- limites ;
- zones ;
- onboarding ;
- nouveaux services.

Les plafonds réglementaires ne doivent pas être augmentés au-delà des limites autorisées par un simple flag.

## 32. Cas KYC/KYB

Le moteur peut configurer :

- étapes activées ;
- fournisseurs de vérification ;
- seuils de revue manuelle ;
- pays pris en charge ;
- documents acceptés.

Les obligations réglementaires obligatoires ne peuvent pas être désactivées par un opérateur non autorisé.

## 33. Cas Jini/Jini Voice

Exemples :

- langues actives ;
- transcription ;
- traduction ;
- résumé ;
- fournisseur IA ;
- durée de conservation ;
- transfert humain ;
- enregistrement ;
- quotas.

Les politiques de confidentialité et consentement restent prioritaires sur les flags produit.

## 34. Configuration côté mobile

Les applications reçoivent un bundle signé/logiquement authentifié contenant uniquement les valeurs nécessaires au client.

Le client ne reçoit jamais :

- secrets ;
- clés privées ;
- credentials provider ;
- règles antifraude confidentielles détaillées ;
- paramètres permettant de contourner une autorisation serveur.

## 35. Cache client

Le bundle client contient :

- version ;
- date de génération ;
- date d’expiration ;
- environnement ;
- valeurs publiques ;
- signature/intégrité si applicable.

En cas de cache expiré, appliquer les valeurs de sécurité prévues.

## 36. Synchronisation temps réel

Canaux possibles :

- polling ;
- webhook interne ;
- WebSocket ;
- pub/sub ;
- message broker.

Un changement critique peut être poussé immédiatement aux services connectés.

## 37. Cohérence distribuée

Chaque service doit connaître :

- la version de configuration ;
- l’heure du dernier refresh ;
- la source ;
- l’état du cache.

Les métriques doivent permettre d’identifier les instances utilisant une version obsolète.

## 38. Versioning

Chaque publication crée une version immuable.

Exemple :

```text
config-version: 2026.08.09.001
```

Une transaction critique peut enregistrer la version de configuration utilisée pour faciliter les investigations.

## 39. Idempotence

Les commandes de publication et rollback doivent être idempotentes.

Un retry réseau ne doit pas créer plusieurs versions actives identiques ou déclencher plusieurs fois un même kill switch.

## 40. Validation avant publication

Avant activation :

- validation de type ;
- validation schéma ;
- vérification des dépendances ;
- détection de contradictions ;
- vérification des scopes ;
- simulation d’impact ;
- tests automatisés si nécessaires.

Une configuration invalide est refusée avant propagation.

## 41. Dépendances entre flags

Le moteur peut exprimer :

```text
requires
conflictsWith
implies
```

Exemple :

`payments.cash.change.enabled` nécessite un périphérique `CHANGE_COIN` ou `CHANGE_BILL` opérationnel.

## 42. Flags temporaires

Chaque flag de rollout ou expérimentation doit avoir :

- propriétaire ;
- date de création ;
- date de revue ;
- date cible de suppression.

Le système doit détecter les flags devenus permanents par oubli.

## 43. Dette de feature flags

Un rapport liste :

- flags à 100 % depuis longtemps ;
- flags à 0 % inutilisés ;
- flags sans propriétaire ;
- flags expirés ;
- code mort potentiel.

Les flags obsolètes doivent être retirés proprement du code et du catalogue.

## 44. Expérimentations A/B

Les expérimentations produit doivent être séparées des contrôles de sécurité.

Une expérience contient :

- hypothèse ;
- population ;
- variantes ;
- métriques ;
- durée ;
- critères d’arrêt ;
- exclusion des populations sensibles si nécessaire.

Les décisions financières réglementées ne doivent pas être randomisées de manière non autorisée.

## 45. Observabilité

Métriques minimales :

- nombre de résolutions de flags ;
- erreurs de résolution ;
- latence ;
- version par instance ;
- taux d’utilisation par variante ;
- kill switches actifs ;
- changements par période ;
- rollbacks ;
- échecs de propagation.

## 46. Alertes

Alertes recommandées :

- kill switch activé ;
- modification CRITICAL ;
- propagation partielle ;
- configuration invalide ;
- instance obsolète ;
- rollout avec taux d’erreur élevé ;
- changement hors fenêtre autorisée ;
- tentative non autorisée.

## 47. Journal d’audit

Chaque événement enregistre :

- acteur ;
- rôle ;
- organisation ;
- clé ;
- ancienne valeur ;
- nouvelle valeur ;
- scope ;
- environnement ;
- date ;
- IP/device lorsque pertinent ;
- motif ;
- approbateur ;
- version ;
- résultat.

L’audit ne peut pas être modifié par l’utilisateur ayant réalisé le changement.

## 48. Sécurité

Mesures minimales :

- TLS ;
- chiffrement des données sensibles ;
- RBAC ;
- MFA pour rôles privilégiés ;
- séparation des tâches ;
- rate limiting ;
- validation stricte ;
- audit immuable ;
- protection contre replay ;
- rotation des credentials du service ;
- sauvegarde de configuration.

## 49. Secrets

Le moteur de configuration n’est pas un secret manager.

Les secrets restent dans :

- secret manager ;
- KMS/HSM ;
- vault ;
- mécanisme approuvé par l’infrastructure.

Une configuration peut référencer un secret par identifiant logique sans contenir sa valeur.

## 50. API interne

Exemples :

```text
GET /internal/config/resolve
GET /internal/config/bundle
POST /admin/config/changes
POST /admin/config/changes/:id/approve
POST /admin/config/changes/:id/publish
POST /admin/config/rollback
POST /admin/kill-switches/:key/activate
POST /admin/kill-switches/:key/deactivate
```

Les endpoints administratifs sont fortement protégés.

## 51. SDK interne

SDK recommandés :

```text
@mansa/config-server
@mansa/config-client
@mansa/feature-flags
```

API conceptuelle :

```text
isEnabled(key, context)
getString(key, context)
getNumber(key, context)
getJson(key, context)
getMoney(key, context)
```

## 52. Contexte de résolution

Exemple :

```json
{
  "country": "ML",
  "organizationId": "org_x",
  "product": "TOLL",
  "channel": "KIOSK",
  "siteId": "site_x",
  "laneId": "lane_2",
  "appVersion": "2.4.0"
}
```

Ne pas inclure plus de données personnelles que nécessaire.

## 53. Performance

Objectif : la lecture d’un flag ne doit pas introduire une dépendance réseau synchrone sur chaque opération critique.

Utiliser :

- cache local ;
- snapshot ;
- rafraîchissement en arrière-plan ;
- invalidation événementielle ;
- valeurs sûres locales.

## 54. Haute disponibilité

Le service central de configuration doit être répliqué.

Une panne du control plane ne doit pas arrêter les paiements déjà configurés.

Data plane et control plane doivent être découplés autant que possible.

## 55. Sauvegarde et restauration

Sauvegarder :

- catalogue ;
- valeurs ;
- versions ;
- historiques ;
- approbations ;
- snapshots.

Tester régulièrement la restauration.

## 56. Tests

Tests obligatoires :

- résolution de priorité ;
- scope ;
- valeur par défaut ;
- cache hors ligne ;
- versioning ;
- rollback ;
- concurrence ;
- RBAC ;
- maker-checker ;
- expiration ;
- rollout stable ;
- kill switch ;
- propagation ;
- mode dégradé ;
- tests multi-tenant.

## 57. Tests péage

Cas minimaux :

- Mobile Money désactivé au niveau national ;
- Mobile Money actif nationalement mais désactivé sur une voie ;
- RFID hors ligne ;
- borne cash indisponible mais carte active ;
- barrière automatique + paiement réussi ;
- ouverture manuelle auditée ;
- fallback télépéage vers borne classique ;
- matériel d’un fournisseur A remplacé par fournisseur B sans changer les règles métier ;
- aucune double facturation après resynchronisation.

## 58. UX administrateur

Avant un changement CRITICAL, afficher clairement :

- ce qui va changer ;
- où ;
- combien d’utilisateurs/sites sont concernés ;
- quand ;
- risque ;
- plan de rollback.

Éviter les simples interrupteurs sans contexte pour les actions financières sensibles.

## 59. Prévisualisation

Le portail doit offrir un mode :

`Prévisualiser la résolution`

L’administrateur saisit un contexte fictif et voit la valeur finale sans la publier.

## 60. Historique

L’historique permet de répondre :

- quelle valeur était active à une date donnée ?
- qui l’a changée ?
- pourquoi ?
- quel rollout était actif ?
- quel service utilisait quelle version ?

## 61. Gouvernance

Chaque domaine possède des propriétaires responsables de ses clés.

Exemple :

- Payments → équipe paiements ;
- Risk → équipe risque ;
- State → équipe secteur public ;
- Access & Mobility → équipe mobilité ;
- Jini → équipe IA ;
- Platform → équipe plateforme.

Les équipes ne doivent pas modifier les clés d’un autre domaine sans permission.

## 62. Nommage

Format recommandé :

```text
domain.subdomain.feature.property
```

Exemples :

```text
payments.mobile_money.enabled
cards.virtual.enabled
toll.cash.enabled
toll.rfid.enabled
access.anpr.minimum_confidence
jini.translation.enabled
```

Les noms restent stables après publication.

## 63. Dépréciation

Pour supprimer une clé :

1. marquer `DEPRECATED` ;
2. identifier les consommateurs ;
3. retirer les lectures côté code ;
4. attendre une version compatible ;
5. archiver la clé ;
6. conserver l’historique.

## 64. Statuts

```text
DRAFT
ACTIVE
SUSPENDED
DEPRECATED
ARCHIVED
```

Un kill switch peut avoir :

```text
INACTIVE
ACTIVE
SCHEDULED
EXPIRED
```

## 65. Critères d’acceptation

Le module est considéré opérationnel lorsque :

- les règles sont résolues de manière déterministe ;
- le multi-tenant est respecté ;
- les modifications sont auditables ;
- les valeurs critiques nécessitent les autorisations prévues ;
- le rollback est testé ;
- les clients fonctionnent avec un cache contrôlé ;
- les kill switches fonctionnent sans redéploiement ;
- les rollouts sont stables ;
- les configurations invalides sont rejetées ;
- aucun secret n’est stocké dans le moteur ;
- le mode hors ligne péage conserve l’absence de double débit ;
- les décisions de référence du domaine État/péage restent respectées.

## 66. Résultat attendu

Mansa dispose ainsi d’un control plane transverse permettant de faire évoluer progressivement la plateforme, d’arrêter rapidement une fonction défaillante, de configurer des différences par pays ou organisation et de piloter les services matériels et financiers sans transformer chaque changement opérationnel en nouveau déploiement logiciel.

Ce moteur doit augmenter la vitesse de livraison sans réduire le niveau de sécurité : plus une configuration est sensible, plus sa gouvernance, son audit et son contrôle doivent être stricts.
