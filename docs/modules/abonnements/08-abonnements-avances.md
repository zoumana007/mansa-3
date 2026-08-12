# 08 — Abonnements avancés

## 1. Objectif

Le module **Abonnements avancés** centralise la détection, le suivi, l’analyse, la gestion et, lorsque les partenaires l’autorisent réellement, l’action sur les abonnements récurrents des utilisateurs Mansa. Il doit aider un particulier, un professionnel ou une organisation à comprendre ce qui est prélevé régulièrement, anticiper les prochains paiements, réduire les dépenses oubliées et piloter les renouvellements depuis un point unique.

Le module ne doit jamais prétendre pouvoir annuler, suspendre, modifier ou rembourser un abonnement si aucune intégration contractuelle/API ne le permet. Dans ces cas, Mansa fournit l’information, les rappels, les instructions ou un lien externe, sans simuler une capacité inexistante.

## 2. Périmètre fonctionnel

Le module couvre :

- détection automatique des paiements récurrents à partir de l’historique de transactions ;
- création manuelle d’un abonnement ;
- rapprochement entre abonnement et marchand/fournisseur ;
- suivi des montants, dates, devises et fréquences ;
- estimation du prochain prélèvement ;
- calendrier des échéances ;
- alertes avant renouvellement ;
- détection d’augmentation de prix ;
- suivi des essais gratuits et périodes promotionnelles ;
- détection des abonnements potentiellement oubliés ;
- budgets dédiés aux abonnements ;
- catégorisation ;
- favoris et abonnements essentiels ;
- notes et pièces jointes ;
- gestion des abonnements partagés/familiaux ;
- abonnements professionnels et multi-utilisateurs ;
- historique de facturation ;
- tentative d’annulation ou de modification uniquement via partenaires autorisés ;
- liens externes vers le fournisseur lorsque nécessaire ;
- calcul du coût mensuel et annuel ;
- prévisions de trésorerie liées aux abonnements ;
- reporting utilisateur et entreprise ;
- intégration Jini pour explication, détection d’anomalies et recommandations ;
- pricing Mansa entièrement configurable depuis l’administration.

## 3. Typologies d’abonnements

Le moteur doit pouvoir gérer au minimum :

- streaming vidéo/audio ;
- télécommunications ;
- Internet ;
- télévision ;
- logiciels SaaS ;
- cloud ;
- presse ;
- jeux ;
- salles de sport ;
- transport ;
- assurances récurrentes lorsque pertinentes ;
- services éducatifs ;
- maintenance ;
- sécurité ;
- abonnements professionnels ;
- adhésions ;
- services publics périodiques ;
- abonnements marchands personnalisés ;
- autres catégories administrables par pays.

Une catégorie n’implique aucune intégration native. Chaque fournisseur est piloté par une configuration et, si disponible, par un adaptateur partenaire.

## 4. Parcours utilisateur

### 4.1 Vue d’ensemble

L’utilisateur ouvre la section **Abonnements** et voit :

- total estimé ce mois ;
- total annuel estimé ;
- prochains prélèvements ;
- abonnements actifs ;
- abonnements en essai ;
- hausses de prix détectées ;
- abonnements suspects ou oubliés ;
- catégories les plus coûteuses ;
- recommandations non contraignantes.

### 4.2 Détection automatique

Le moteur analyse les transactions autorisées et cherche des motifs récurrents selon :

- marchand normalisé ;
- montant exact ou proche ;
- fréquence ;
- date habituelle ;
- devise ;
- libellé ;
- canal de paiement ;
- identifiant fournisseur si présent ;
- historique suffisant.

Le résultat est classé avec un score de confiance :

- `LOW_CONFIDENCE` ;
- `MEDIUM_CONFIDENCE` ;
- `HIGH_CONFIDENCE` ;
- `CONFIRMED_BY_USER` ;
- `CONFIRMED_BY_PROVIDER`.

L’utilisateur peut confirmer, corriger ou ignorer une détection.

### 4.3 Création manuelle

L’utilisateur peut ajouter :

- nom ;
- fournisseur ;
- catégorie ;
- montant ;
- devise ;
- fréquence ;
- prochaine date ;
- méthode de paiement ;
- période d’essai ;
- date de renouvellement ;
- notes ;
- bénéficiaires/membres ;
- rappel souhaité.

### 4.4 Gestion d’un abonnement

Depuis la fiche :

- consulter les transactions liées ;
- voir le coût mensuel/annuel ;
- voir l’évolution du prix ;
- changer les rappels ;
- marquer comme essentiel ;
- ajouter une note ;
- archiver ;
- signaler une erreur de détection ;
- demander une action si un partenaire le permet ;
- accéder au lien externe du fournisseur sinon.

### 4.5 Annulation/modification

Trois modes sont distingués :

1. `INFORMATION_ONLY` : Mansa informe uniquement ;
2. `DEEPLINK_EXTERNAL` : Mansa redirige vers le fournisseur ;
3. `PARTNER_ACTION` : Mansa peut envoyer une demande API au fournisseur/partenaire.

Dans le troisième cas, toute action sensible doit retourner un état traçable :

- `REQUESTED` ;
- `PROCESSING` ;
- `CONFIRMED` ;
- `REJECTED` ;
- `FAILED` ;
- `CANCELLED`.

Mansa ne doit jamais afficher « annulé » tant que le fournisseur n’a pas confirmé.

## 5. États métier principaux

### SubscriptionStatus

- `DETECTED` ;
- `ACTIVE` ;
- `TRIAL` ;
- `PAUSED` ;
- `CANCELLATION_REQUESTED` ;
- `CANCELLED` ;
- `EXPIRED` ;
- `UNKNOWN` ;
- `ARCHIVED`.

### BillingFrequency

- `DAILY` ;
- `WEEKLY` ;
- `MONTHLY` ;
- `BIMONTHLY` ;
- `QUARTERLY` ;
- `SEMI_ANNUAL` ;
- `ANNUAL` ;
- `CUSTOM` ;
- `UNKNOWN`.

### PriceChangeStatus

- `NONE` ;
- `POSSIBLE_INCREASE` ;
- `CONFIRMED_INCREASE` ;
- `POSSIBLE_DECREASE` ;
- `CONFIRMED_DECREASE`.

## 6. Modèle de données recommandé

### Subscription

- `id` ;
- `ownerType` ;
- `ownerId` ;
- `providerId?` ;
- `displayName` ;
- `normalizedMerchantName?` ;
- `categoryId` ;
- `status` ;
- `detectionConfidence` ;
- `amount` ;
- `currency` ;
- `billingFrequency` ;
- `customFrequencyDays?` ;
- `startedAt?` ;
- `trialEndsAt?` ;
- `nextBillingAt?` ;
- `renewalAt?` ;
- `cancelledAt?` ;
- `lastChargedAt?` ;
- `paymentInstrumentId?` ;
- `isEssential` ;
- `isShared` ;
- `countryCode` ;
- `metadata` ;
- `createdAt` ;
- `updatedAt`.

### SubscriptionTransactionLink

Lie une transaction Mansa à un abonnement avec :

- `subscriptionId` ;
- `transactionId` ;
- `matchScore` ;
- `matchReason` ;
- `confirmedBy` ;
- `createdAt`.

### SubscriptionPriceHistory

- `subscriptionId` ;
- `amount` ;
- `currency` ;
- `effectiveAt` ;
- `source` ;
- `confidence`.

### SubscriptionReminder

- `subscriptionId` ;
- `channel` ;
- `offsetDays` ;
- `isEnabled` ;
- `quietHoursPolicy` ;
- `lastSentAt?`.

### SubscriptionActionRequest

- `subscriptionId` ;
- `actionType` ;
- `providerAdapter` ;
- `status` ;
- `requestedBy` ;
- `requestedAt` ;
- `completedAt?` ;
- `externalReference?` ;
- `failureCode?` ;
- `failureMessageSafe?` ;
- `idempotencyKey`.

### SubscriptionProvider

- `id` ;
- `name` ;
- `countryCodes` ;
- `capabilities` ;
- `integrationMode` ;
- `supportUrl?` ;
- `termsUrl?` ;
- `status` ;
- `featureFlags`.

### SubscriptionBudget

- `ownerId` ;
- `monthlyLimit` ;
- `currency` ;
- `categoryId?` ;
- `warningThresholdPercent` ;
- `isEnabled`.

## 7. Détection de récurrence

Le moteur de détection doit rester explicable et auditable. Il peut combiner règles statistiques et IA, mais doit conserver les signaux ayant mené à la classification.

Exemples de signaux :

- même marchand sur plusieurs cycles ;
- intervalle temporel stable ;
- montant stable ou variation limitée ;
- libellés proches ;
- même instrument de paiement ;
- code marchand récurrent ;
- transaction marquée recurring par le réseau/partenaire ;
- confirmation utilisateur.

Un modèle d’IA ne doit pas seul déclencher une action financière ou une annulation.

## 8. Calculs et prévisions

Le module calcule :

- coût mensuel normalisé ;
- coût annuel normalisé ;
- dépenses déjà payées sur période ;
- prévision du mois suivant ;
- échéances à 7/30/90 jours ;
- variation de prix ;
- poids des abonnements dans le budget ;
- économies potentielles purement indicatives.

Pour les devises étrangères, conserver :

- montant source ;
- devise source ;
- équivalent indicatif ;
- taux utilisé ;
- timestamp du taux.

L’équivalent converti ne remplace jamais le montant réellement débité.

## 9. Règles métier

- aucune annulation ne peut être considérée comme effective sans confirmation du fournisseur ;
- une transaction historique ne doit jamais être réécrite parce que la catégorisation a changé ;
- une correction utilisateur améliore la détection future sans supprimer l’audit initial ;
- la création automatique d’un abonnement doit être réversible ;
- les essais gratuits doivent générer un rappel avant conversion payante lorsque la date est connue ;
- une hausse de prix doit être signalée uniquement après comparaison avec un historique suffisamment fiable ;
- une fluctuation de change ne doit pas être confondue avec une hausse fournisseur ;
- les abonnements professionnels doivent supporter plusieurs sièges/utilisateurs ;
- les données nécessaires à l’analyse doivent être minimisées ;
- aucune donnée de carte brute ne doit être stockée dans ce module.

## 10. RBAC / ABAC

### Rôles indicatifs

- `CUSTOMER` ;
- `BUSINESS_MEMBER` ;
- `BUSINESS_MANAGER` ;
- `BUSINESS_ADMIN` ;
- `SUPPORT_AGENT` ;
- `RISK_ANALYST` ;
- `COMPLIANCE_OFFICER` ;
- `PRICING_MANAGER` ;
- `SUPER_ADMIN` ;
- `PROVIDER_SERVICE_ACCOUNT`.

### Exemples ABAC

Les décisions tiennent compte de :

- propriétaire de l’abonnement ;
- organisation ;
- pays ;
- fournisseur ;
- type d’action ;
- niveau d’authentification ;
- montant ;
- risque ;
- statut KYC/KYB lorsque pertinent ;
- capacité partenaire active ;
- environnement Test/Recette/Production.

Un agent support peut consulter une vue limitée sans pouvoir déclencher une action financière ou une annulation, sauf permission explicite.

## 11. API

Exemples d’API internes/publiques versionnées :

- `GET /v1/subscriptions` ;
- `POST /v1/subscriptions` ;
- `GET /v1/subscriptions/:id` ;
- `PATCH /v1/subscriptions/:id` ;
- `POST /v1/subscriptions/:id/confirm` ;
- `POST /v1/subscriptions/:id/archive` ;
- `GET /v1/subscriptions/:id/transactions` ;
- `GET /v1/subscriptions/:id/price-history` ;
- `POST /v1/subscriptions/:id/reminders` ;
- `POST /v1/subscriptions/:id/actions/cancel` ;
- `POST /v1/subscriptions/:id/actions/pause` ;
- `GET /v1/subscriptions/calendar` ;
- `GET /v1/subscriptions/insights` ;
- `GET /v1/subscriptions/budget` ;
- `PUT /v1/subscriptions/budget`.

Toute écriture sensible doit supporter :

- idempotency key ;
- correlation ID ;
- audit actor ;
- contrôle d’autorisation ;
- version d’API ;
- erreurs métier structurées.

## 12. Webhooks

Événements possibles :

- `subscription.detected` ;
- `subscription.confirmed` ;
- `subscription.updated` ;
- `subscription.price_change_detected` ;
- `subscription.trial_ending` ;
- `subscription.billing_due` ;
- `subscription.action_requested` ;
- `subscription.action_confirmed` ;
- `subscription.action_failed` ;
- `subscription.cancelled` ;
- `subscription.budget_threshold_reached`.

Les webhooks sortants doivent être signés, rejouables, idempotents et disposer de politiques de retry/backoff.

## 13. Intégrations partenaires

Créer une interface `SubscriptionProviderAdapter` avec capacités déclaratives :

- `canLookupSubscription` ;
- `canCancel` ;
- `canPause` ;
- `canResume` ;
- `canChangePlan` ;
- `canFetchInvoices` ;
- `canFetchRenewalDate` ;
- `canReceiveWebhooks`.

Implémentations possibles :

- `MockSubscriptionProviderAdapter` ;
- adaptateurs fournisseurs réels ajoutés uniquement après contrat ;
- redirection web externe si aucune API.

Aucun fournisseur ne doit être codé comme garanti ou universel.

## 14. Administration

Le portail Admin permet :

- activer/désactiver le module par pays ;
- gérer les catégories ;
- gérer les fournisseurs connus ;
- configurer les capacités de chaque intégration ;
- régler les seuils de détection ;
- gérer les feature flags ;
- gérer les rappels par défaut ;
- superviser les erreurs d’intégration ;
- gérer les règles de pricing ;
- consulter les audits ;
- voir les volumes et taux de confirmation ;
- désactiver une intégration défaillante sans déployer du code.

## 15. Pricing & Commission Engine

Le module doit consommer le moteur central de tarification Mansa et ne jamais coder les frais en dur.

Les règles configurables peuvent inclure :

- frais fixes ;
- pourcentage ;
- fixe + pourcentage ;
- minimum ;
- maximum ;
- paliers ;
- gratuité ;
- nombre d’opérations gratuites ;
- promotion temporaire ;
- pays ;
- devise ;
- canal ;
- type d’utilisateur ;
- segment ;
- fournisseur ;
- volume ;
- commission Mansa ;
- commission partenaire ;
- commission apporteur ;
- taxes séparées ;
- date d’effet ;
- date de fin.

Toutes les opérations payantes doivent capturer un `PricingSnapshot` contenant :

- règle appliquée ;
- version ;
- base de calcul ;
- frais Mansa ;
- commissions ;
- taxes ;
- total ;
- devise ;
- timestamp ;
- pays ;
- canal.

Une transaction ancienne conserve toujours son snapshot historique, même si l’admin change les tarifs ensuite.

Workflow de changement tarifaire :

`DRAFT -> SIMULATED -> PENDING_APPROVAL -> SCHEDULED -> ACTIVE -> EXPIRED/REVOKED`.

Les modifications sensibles doivent être approuvées selon séparation des rôles et entièrement auditées.

## 16. Feature flags

Exemples :

- `subscriptions.enabled` ;
- `subscriptions.auto_detection.enabled` ;
- `subscriptions.price_change_detection.enabled` ;
- `subscriptions.trial_alerts.enabled` ;
- `subscriptions.provider_actions.enabled` ;
- `subscriptions.jini_insights.enabled` ;
- `subscriptions.business_mode.enabled` ;
- `subscriptions.multi_currency.enabled`.

Portée possible : globale, pays, segment, organisation, fournisseur, environnement.

## 17. Notifications

Canaux selon consentement et disponibilité :

- push ;
- in-app ;
- SMS ;
- email ;
- Jini ;
- webhook entreprise.

Types :

- prélèvement imminent ;
- essai gratuit bientôt terminé ;
- augmentation détectée ;
- budget dépassé ;
- action fournisseur confirmée/échouée ;
- abonnement potentiellement oublié.

Respecter quiet hours, préférences et obligations réglementaires.

## 18. Sécurité

- chiffrement en transit et au repos ;
- aucun PAN/CVV brut dans le module ;
- tokenisation des instruments de paiement ;
- séparation logique multi-tenant ;
- contrôle d’accès fin ;
- step-up authentication pour actions sensibles ;
- protection anti-CSRF/replay selon canal ;
- signatures webhooks ;
- secrets partenaires stockés dans un secret manager ;
- logs sans données sensibles ;
- limitation de débit ;
- protection contre abus automatisés.

## 19. Fraude et risque

Cas à détecter :

- faux fournisseur ;
- transaction récurrente suspecte ;
- prise de contrôle de compte avant demande d’annulation ;
- modification massive de plusieurs abonnements ;
- fournisseur partenaire retournant des statuts incohérents ;
- spam de requêtes d’action ;
- tentative d’exploitation des promotions Mansa ;
- contournement des limites tarifaires.

Les décisions automatiques à impact fort doivent être auditables et contestables.

## 20. Conformité et données

Le module doit appliquer les politiques Mansa de rétention, suppression et export.

Conserver uniquement ce qui est nécessaire :

- métadonnées d’abonnement ;
- références de transactions ;
- préférences ;
- actions ;
- preuves d’intégration ;
- audits obligatoires.

Les données dérivées par IA doivent avoir une provenance, une date de calcul et une durée de validité.

## 21. Multi-pays / multi-devises

Chaque règle doit pouvoir varier selon :

- pays ;
- devise ;
- réglementation ;
- fournisseur ;
- disponibilité API ;
- type de paiement ;
- politique de notification ;
- fiscalité ;
- pricing.

Le module ne doit jamais supposer que les mêmes capacités sont disponibles au Mali, en France ou dans un autre pays.

## 22. Réseau faible et hors ligne

En réseau faible :

- afficher le cache du dernier état connu ;
- marquer clairement la date de dernière synchronisation ;
- permettre les modifications locales non sensibles en file d’attente ;
- ne jamais simuler une annulation fournisseur hors ligne ;
- synchroniser avec idempotence ;
- résoudre les conflits avec versioning.

Les actions fournisseur sensibles exigent une confirmation serveur.

## 23. Jini

Jini peut :

- expliquer les dépenses récurrentes ;
- résumer les abonnements ;
- signaler une hausse probable ;
- répondre « combien je dépense par mois ? » ;
- proposer des rappels ;
- aider à retrouver un abonnement ;
- préparer une action autorisée.

Jini ne peut pas :

- annuler sans autorisation et capacité partenaire ;
- inventer un remboursement ;
- modifier une méthode de paiement sans authentification ;
- promettre une économie ;
- déclencher une action sensible sans politique d’autorisation.

## 24. Observabilité

Métriques principales :

- nombre d’abonnements détectés ;
- taux de confirmation ;
- faux positifs ;
- précision des dates prédites ;
- nombre d’augmentations détectées ;
- succès/échec des actions partenaires ;
- latence API ;
- webhooks en erreur ;
- taux de retries ;
- revenu/frais par règle tarifaire ;
- coût infrastructure par utilisateur actif.

Alertes sur :

- hausse des erreurs partenaire ;
- boucle de détection ;
- chute de précision ;
- retard de traitement ;
- incohérence de pricing ;
- divergence de statuts.

## 25. Résilience

- files de messages durables ;
- retries avec backoff ;
- idempotence ;
- circuit breakers partenaires ;
- dead-letter queue ;
- replay contrôlé ;
- timeouts explicites ;
- dégradation gracieuse en mode information-only ;
- reconciliation périodique ;
- reprise après incident documentée.

## 26. Tests fonctionnels

Tester au minimum :

- détection mensuelle correcte ;
- faux positif ;
- correction utilisateur ;
- essai gratuit ;
- hausse de prix ;
- changement de devise ;
- abonnement annuel ;
- abonnement manuel ;
- fournisseur sans API ;
- fournisseur avec API ;
- annulation confirmée ;
- annulation rejetée ;
- timeout partenaire ;
- retry idempotent ;
- budget dépassé ;
- notification ;
- pricing gratuit ;
- frais fixes ;
- frais pourcentage ;
- fixe + pourcentage ;
- changement de tarif planifié ;
- conservation du snapshot historique.

## 27. Tests sécurité

- accès cross-tenant interdit ;
- escalation de privilèges ;
- replay d’action ;
- webhooks forgés ;
- brute force ;
- injection ;
- fuite de secrets ;
- logs sensibles ;
- abuse rate limit ;
- idempotency collision ;
- session compromise ;
- modification tarifaire non autorisée.

## 28. Tests performance

Mesurer :

- scan massif de transactions ;
- génération calendrier ;
- calcul de prévisions ;
- batch de notifications ;
- traitement de webhooks ;
- pics avant dates de renouvellement ;
- calculs multi-devises ;
- dashboard entreprise avec grand nombre d’abonnements.

## 29. Ordre de développement recommandé

1. modèles de données et migrations ;
2. catégorisation et création manuelle ;
3. linking transactions-abonnements ;
4. moteur de détection ;
5. calendrier et rappels ;
6. price history et détection de variation ;
7. budgets ;
8. API et RBAC/ABAC ;
9. adaptateur fournisseur mock ;
10. actions partenaires abstraites ;
11. pricing engine integration ;
12. Jini ;
13. observabilité ;
14. tests de résilience et sécurité ;
15. activation progressive par feature flags.

## 30. Critères d’acceptation

Le module est considéré prêt lorsque :

- un utilisateur peut voir, créer, confirmer, corriger et archiver ses abonnements ;
- la détection de récurrence est explicable et auditée ;
- les prochaines échéances sont calculées sans réécrire l’historique ;
- les hausses de prix distinguent variation fournisseur et variation de change ;
- les essais gratuits peuvent produire des alertes ;
- aucune annulation n’est affichée comme terminée sans confirmation externe ;
- les intégrations fournisseurs sont abstraites ;
- le système fonctionne en multi-pays et multi-devises ;
- les permissions interdisent l’accès cross-tenant ;
- les écritures sensibles sont idempotentes ;
- les webhooks sont signés et rejouables ;
- les modes réseau faible sont explicites ;
- aucun secret ni donnée carte brute n’est stocké ;
- les frais et commissions sont entièrement configurables depuis l’administration ;
- chaque opération tarifée conserve un snapshot de pricing versionné ;
- les tests fonctionnels, sécurité, résilience et performance essentiels passent.

## 31. Hypothèses à valider

- disponibilité réelle des API d’annulation/modification selon fournisseur ;
- capacité d’obtenir des indicateurs recurring auprès des partenaires de paiement ;
- règles locales sur l’agrégation et l’analyse transactionnelle ;
- fournisseurs à intégrer en priorité par pays ;
- politique commerciale Mansa sur les services premium d’analyse d’abonnements.

Aucune hypothèse ci-dessus ne doit être présentée comme une capacité déjà contractée.