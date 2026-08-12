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

Le moteur doit pouvoir gérer au minimum : streaming vidéo/audio, télécommunications, Internet, télévision, logiciels SaaS, cloud, presse, jeux, salles de sport, transport, assurances récurrentes lorsque pertinentes, services éducatifs, maintenance, sécurité, abonnements professionnels, adhésions, services publics périodiques, abonnements marchands personnalisés et autres catégories administrables par pays.

Une catégorie n’implique aucune intégration native. Chaque fournisseur est piloté par une configuration et, si disponible, par un adaptateur partenaire.

## 4. Parcours utilisateur

### 4.1 Vue d’ensemble

L’utilisateur voit le total estimé du mois, le total annuel estimé, les prochains prélèvements, abonnements actifs/en essai, hausses de prix détectées, abonnements suspects ou oubliés, catégories les plus coûteuses et recommandations non contraignantes.

### 4.2 Détection automatique

Le moteur analyse les transactions autorisées et cherche des motifs récurrents selon le marchand normalisé, le montant exact ou proche, la fréquence, la date habituelle, la devise, le libellé, le canal de paiement, l’identifiant fournisseur si présent et un historique suffisant.

Le résultat est classé `LOW_CONFIDENCE`, `MEDIUM_CONFIDENCE`, `HIGH_CONFIDENCE`, `CONFIRMED_BY_USER` ou `CONFIRMED_BY_PROVIDER`. L’utilisateur peut confirmer, corriger ou ignorer une détection.

### 4.3 Création manuelle

L’utilisateur peut ajouter : nom, fournisseur, catégorie, montant, devise, fréquence, prochaine date, méthode de paiement, période d’essai, date de renouvellement, notes, bénéficiaires/membres et rappel souhaité.

### 4.4 Gestion

Depuis la fiche : consulter les transactions liées, coût mensuel/annuel, évolution du prix, rappels, statut essentiel, notes, archivage, correction de détection, demande d’action si un partenaire le permet ou lien externe sinon.

### 4.5 Annulation/modification

Trois modes :

1. `INFORMATION_ONLY` : Mansa informe uniquement ;
2. `DEEPLINK_EXTERNAL` : Mansa redirige vers le fournisseur ;
3. `PARTNER_ACTION` : Mansa peut envoyer une demande API au fournisseur/partenaire.

Les actions sensibles utilisent les statuts `REQUESTED`, `PROCESSING`, `CONFIRMED`, `REJECTED`, `FAILED`, `CANCELLED`. Mansa ne doit jamais afficher « annulé » tant que le fournisseur n’a pas confirmé.

## 5. États métier

`SubscriptionStatus` : `DETECTED`, `ACTIVE`, `TRIAL`, `PAUSED`, `CANCELLATION_REQUESTED`, `CANCELLED`, `EXPIRED`, `UNKNOWN`, `ARCHIVED`.

`BillingFrequency` : `DAILY`, `WEEKLY`, `MONTHLY`, `BIMONTHLY`, `QUARTERLY`, `SEMI_ANNUAL`, `ANNUAL`, `CUSTOM`, `UNKNOWN`.

`PriceChangeStatus` : `NONE`, `POSSIBLE_INCREASE`, `CONFIRMED_INCREASE`, `POSSIBLE_DECREASE`, `CONFIRMED_DECREASE`.

## 6. Modèle de données recommandé

### Subscription

`id`, `ownerType`, `ownerId`, `providerId?`, `displayName`, `normalizedMerchantName?`, `categoryId`, `status`, `detectionConfidence`, `amount`, `currency`, `billingFrequency`, `customFrequencyDays?`, `startedAt?`, `trialEndsAt?`, `nextBillingAt?`, `renewalAt?`, `cancelledAt?`, `lastChargedAt?`, `paymentInstrumentId?`, `isEssential`, `isShared`, `countryCode`, `metadata`, `createdAt`, `updatedAt`.

### SubscriptionTransactionLink

`subscriptionId`, `transactionId`, `matchScore`, `matchReason`, `confirmedBy`, `createdAt`.

### SubscriptionPriceHistory

`subscriptionId`, `amount`, `currency`, `effectiveAt`, `source`, `confidence`.

### SubscriptionReminder

`subscriptionId`, `channel`, `offsetDays`, `isEnabled`, `quietHoursPolicy`, `lastSentAt?`.

### SubscriptionActionRequest

`subscriptionId`, `actionType`, `providerAdapter`, `status`, `requestedBy`, `requestedAt`, `completedAt?`, `externalReference?`, `failureCode?`, `failureMessageSafe?`, `idempotencyKey`.

### SubscriptionProvider

`id`, `name`, `countryCodes`, `capabilities`, `integrationMode`, `supportUrl?`, `termsUrl?`, `status`, `featureFlags`.

### SubscriptionBudget

`ownerId`, `monthlyLimit`, `currency`, `categoryId?`, `warningThresholdPercent`, `isEnabled`.

## 7. Détection de récurrence

Le moteur doit rester explicable et auditable. Il peut combiner règles statistiques et IA, mais conserve les signaux ayant mené à la classification : marchand répété, intervalle stable, montant stable ou variation limitée, libellés proches, même instrument, code marchand récurrent, indicateur recurring du réseau/partenaire et confirmation utilisateur.

Un modèle d’IA ne doit jamais déclencher seul une action financière ou une annulation.

## 8. Calculs et prévisions

Calculer coût mensuel normalisé, coût annuel, dépenses déjà payées, prévision du mois suivant, échéances à 7/30/90 jours, variation de prix, poids dans le budget et économies potentielles purement indicatives.

Pour les devises étrangères, conserver montant source, devise source, équivalent indicatif, taux utilisé et timestamp. L’équivalent converti ne remplace jamais le montant réellement débité.

## 9. Règles métier

- aucune annulation effective sans confirmation fournisseur ;
- aucune réécriture des transactions historiques ;
- les corrections utilisateur alimentent la détection future sans supprimer l’audit initial ;
- une détection automatique doit être réversible ;
- rappels avant conversion d’essai lorsque la date est connue ;
- hausse de prix seulement avec historique suffisamment fiable ;
- variation de change distinguée d’une hausse fournisseur ;
- abonnements professionnels multi-sièges ;
- minimisation des données ;
- aucune donnée carte brute dans ce module.

## 10. RBAC / ABAC

Rôles : `CUSTOMER`, `BUSINESS_MEMBER`, `BUSINESS_MANAGER`, `BUSINESS_ADMIN`, `SUPPORT_AGENT`, `RISK_ANALYST`, `COMPLIANCE_OFFICER`, `PRICING_MANAGER`, `SUPER_ADMIN`, `PROVIDER_SERVICE_ACCOUNT`.

Les décisions ABAC prennent en compte propriétaire, organisation, pays, fournisseur, action, niveau d’authentification, montant, risque, KYC/KYB si pertinent, capacité partenaire et environnement. Le support dispose d’une vue limitée et ne déclenche pas d’action sensible sans permission explicite.

## 11. API

Exemples : `GET /v1/subscriptions`, `POST /v1/subscriptions`, `GET/PATCH /v1/subscriptions/:id`, `POST /v1/subscriptions/:id/confirm`, `POST /v1/subscriptions/:id/archive`, `GET /v1/subscriptions/:id/transactions`, `GET /v1/subscriptions/:id/price-history`, `POST /v1/subscriptions/:id/reminders`, `POST /v1/subscriptions/:id/actions/cancel`, `POST /v1/subscriptions/:id/actions/pause`, `GET /v1/subscriptions/calendar`, `GET /v1/subscriptions/insights`, `GET/PUT /v1/subscriptions/budget`.

Toute écriture sensible supporte idempotency key, correlation ID, audit actor, contrôle d’autorisation, version d’API et erreurs métier structurées.

## 12. Webhooks

Événements : `subscription.detected`, `subscription.confirmed`, `subscription.updated`, `subscription.price_change_detected`, `subscription.trial_ending`, `subscription.billing_due`, `subscription.action_requested`, `subscription.action_confirmed`, `subscription.action_failed`, `subscription.cancelled`, `subscription.budget_threshold_reached`.

Les webhooks sortants sont signés, rejouables, idempotents et utilisent retry/backoff.

## 13. Intégrations partenaires

Interface `SubscriptionProviderAdapter` avec capacités déclaratives : `canLookupSubscription`, `canCancel`, `canPause`, `canResume`, `canChangePlan`, `canFetchInvoices`, `canFetchRenewalDate`, `canReceiveWebhooks`.

Prévoir `MockSubscriptionProviderAdapter`, puis des adaptateurs réels uniquement après contrat. En absence d’API, redirection externe. Aucun fournisseur n’est codé comme garanti ou universel.

## 14. Administration

Le portail Admin permet : activation par pays, catégories, fournisseurs connus, capacités d’intégration, seuils de détection, feature flags, rappels par défaut, erreurs d’intégration, règles de pricing, audits, volumes, taux de confirmation et désactivation d’une intégration défaillante sans déploiement.

## 15. Pricing & Commission Engine

Le module consomme le moteur central Mansa et ne code jamais les frais en dur.

Règles configurables : frais fixes, pourcentage, fixe + pourcentage, minimum, maximum, paliers, gratuité, nombre d’opérations gratuites, promotion temporaire, pays, devise, canal, type d’utilisateur, segment, fournisseur, volume, commission Mansa, partenaire, apporteur, taxes séparées, date d’effet et date de fin.

Chaque opération payante capture un `PricingSnapshot` : règle, version, base de calcul, frais Mansa, commissions, taxes, total, devise, timestamp, pays, canal. Une opération historique conserve son snapshot même après changement tarifaire.

Workflow : `DRAFT -> SIMULATED -> PENDING_APPROVAL -> SCHEDULED -> ACTIVE -> EXPIRED/REVOKED`. Les changements sensibles appliquent séparation des rôles et audit immuable.

## 16. Feature flags

`subscriptions.enabled`, `subscriptions.auto_detection.enabled`, `subscriptions.price_change_detection.enabled`, `subscriptions.trial_alerts.enabled`, `subscriptions.provider_actions.enabled`, `subscriptions.jini_insights.enabled`, `subscriptions.business_mode.enabled`, `subscriptions.multi_currency.enabled`.

Portée : globale, pays, segment, organisation, fournisseur, environnement.

## 17. Notifications

Canaux selon consentement : push, in-app, SMS, email, Jini, webhook entreprise. Cas : prélèvement imminent, essai gratuit bientôt terminé, augmentation détectée, budget dépassé, action fournisseur confirmée/échouée, abonnement potentiellement oublié. Respect des quiet hours et préférences.

## 18. Sécurité

Chiffrement transit/repos, aucun PAN/CVV brut, tokenisation, isolation multi-tenant, contrôle d’accès fin, step-up auth pour actions sensibles, anti-CSRF/replay selon canal, signatures webhooks, secrets dans secret manager, logs sans données sensibles, rate limiting et protection contre abus automatisés.

## 19. Fraude et risque

Détecter faux fournisseur, récurrence suspecte, takeover avant action, modifications massives, statuts partenaires incohérents, spam d’actions, abus promotions et contournement tarifaire. Les décisions automatiques à impact fort doivent être auditables et contestables.

## 20. Conformité et données

Appliquer les politiques Mansa de rétention, suppression et export. Conserver uniquement métadonnées d’abonnement, références de transactions, préférences, actions, preuves d’intégration et audits nécessaires. Toute donnée dérivée IA conserve provenance, date de calcul et durée de validité.

## 21. Multi-pays / multi-devises

Chaque règle peut varier selon pays, devise, réglementation, fournisseur, disponibilité API, type de paiement, notifications, fiscalité et pricing. Ne jamais supposer les mêmes capacités dans tous les pays.

## 22. Réseau faible et hors ligne

Afficher le dernier état connu avec date de synchronisation, mettre en file les modifications locales non sensibles, ne jamais simuler une annulation partenaire hors ligne, synchroniser avec idempotence et versioning. Les actions sensibles exigent confirmation serveur.

## 23. Jini

Jini peut expliquer les dépenses récurrentes, résumer les abonnements, signaler une hausse probable, calculer les dépenses mensuelles, proposer des rappels, retrouver un abonnement et préparer une action autorisée. Il ne peut annuler sans autorisation/capacité partenaire, inventer un remboursement, modifier un moyen de paiement sans authentification, promettre une économie ou déclencher une action sensible hors politique.

## 24. Observabilité

Mesurer nombre d’abonnements détectés, taux de confirmation, faux positifs, précision des dates, hausses détectées, succès/échec partenaires, latence API, webhooks en erreur, retries, revenus/frais par règle tarifaire et coût infrastructure par utilisateur actif. Alerter sur erreurs partenaires, boucle de détection, chute de précision, retard de traitement, incohérence pricing et divergence de statuts.

## 25. Résilience

Files durables, retries avec backoff, idempotence, circuit breakers, dead-letter queue, replay contrôlé, timeouts explicites, dégradation gracieuse en information-only, réconciliation périodique et reprise après incident documentée.

## 26. Tests

Fonctionnels : détection mensuelle, faux positif, correction utilisateur, essai gratuit, hausse de prix, changement de devise, abonnement annuel, manuel, fournisseur sans/avec API, annulation confirmée/rejetée, timeout, retry idempotent, budget, notifications, pricing gratuit/fixe/%/mixte, tarif planifié et conservation du snapshot historique.

Sécurité : cross-tenant, escalade de privilège, replay, webhook forgé, brute force, injection, fuite de secrets, logs sensibles, rate limit, collision idempotence, compromission de session et modification tarifaire non autorisée.

Performance : scan massif de transactions, génération calendrier, prévisions, notifications batch, webhooks, pics de renouvellement, multi-devises et dashboard entreprise volumineux.

## 27. Ordre de développement

1. modèles et migrations ; 2. catégorisation/création manuelle ; 3. linking transactions ; 4. détection ; 5. calendrier/rappels ; 6. historique de prix ; 7. budgets ; 8. API + RBAC/ABAC ; 9. adaptateur mock ; 10. actions partenaires abstraites ; 11. pricing engine ; 12. Jini ; 13. observabilité ; 14. résilience/sécurité ; 15. activation progressive par feature flags.

## 28. Critères d’acceptation

Le module est prêt lorsque l’utilisateur peut voir, créer, confirmer, corriger et archiver ses abonnements ; la détection est explicable/auditée ; les échéances ne réécrivent pas l’historique ; les hausses distinguent change et prix fournisseur ; les essais génèrent des alertes ; aucune annulation n’est affichée terminée sans confirmation ; les intégrations sont abstraites ; multi-pays/multi-devises, isolation cross-tenant, idempotence, webhooks signés, réseau faible, aucun secret/PAN brut, pricing configurable, snapshot versionné et tests essentiels sont couverts.

## 29. Hypothèses à valider

Disponibilité réelle des API d’annulation/modification selon fournisseur, indicateurs recurring des partenaires de paiement, règles locales d’agrégation transactionnelle, fournisseurs prioritaires par pays et politique commerciale Mansa pour les fonctions premium.

Aucune hypothèse ci-dessus ne doit être présentée comme une capacité déjà contractée.