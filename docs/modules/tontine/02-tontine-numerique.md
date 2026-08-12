# Tontine numérique Mansa

## 1. Objet et positionnement

Ce document définit le module **Tontine** de Mansa. Il couvre la création et l’administration de groupes de tontine, les cotisations, les tours de bénéficiaires, les calendriers, les versements, les retards, les remplacements, les incidents, les litiges, les règles de conformité, les frais et commissions, la sécurité, l’audit et les intégrations financières nécessaires.

Le module doit être conçu comme une brique autonome de la plateforme Mansa, réutilisable dans l’application Client, les espaces Entreprise/Association, le portail Admin, le Hub et les API partenaires.

Une tontine Mansa ne doit jamais être implémentée comme un simple groupe de discussion ou une suite de transferts P2P. Elle possède son propre cycle de vie, ses membres, ses règles de cotisation, son ordre de passage, ses bénéficiaires, ses échéances, sa gouvernance, ses garanties de traçabilité et ses contrôles de conformité.

Le produit doit pouvoir représenter les usages traditionnels de tontine sans les dénaturer, tout en ajoutant des mécanismes de preuve, de transparence et de sécurité adaptés à un service financier numérique.

## 2. Principes directeurs

1. **Règles explicites avant engagement** : montant, fréquence, nombre de membres, ordre de passage, dates, pénalités éventuelles, modalités de sortie, frais et conditions de remplacement doivent être visibles avant adhésion.
2. **Traçabilité financière complète** : toute cotisation, distribution, remboursement, pénalité, frais, modification sensible ou action d’administration doit être auditée.
3. **Ledger central** : aucun solde de tontine ne doit être maintenu par un simple champ modifiable. Les positions sont dérivées d’écritures comptables immuables et d’agrégats recalculables.
4. **Conformité par pays** : la disponibilité du produit, les plafonds, les moyens de paiement, les règles KYC/KYB, les restrictions de groupe et les limites doivent être configurables par pays.
5. **Pricing centralisé** : aucun frais métier ne doit être codé en dur. Tous les frais et commissions doivent être résolus par le Pricing & Commission Engine Mansa.
6. **Séparation des rôles** : l’administrateur d’une tontine ne doit pas pouvoir modifier arbitrairement des montants, réécrire un historique financier ou contourner les contrôles Mansa.
7. **Idempotence** : une cotisation, une distribution, un remboursement ou une régularisation ne doit jamais être comptabilisé deux fois.
8. **Minimisation des données** : seules les données nécessaires à l’exécution, la conformité, la preuve, la fraude et les obligations légales sont conservées.
9. **Résilience réseau** : les parcours de consultation et de préparation doivent tolérer un réseau faible ; les opérations financières doivent rester sûres, synchronisées et non duplicables.
10. **Partenaires abstraits** : banques, Mobile Money, cartes, acquéreurs, KYC/KYB et autres rails sont intégrés derrière des adaptateurs. Aucun partenaire réel n’est supposé disponible sans contrat.

## 3. Types de tontine

Enumération recommandée `TontineType` :

- `ROTATING_STANDARD` : cotisation fixe, bénéficiaire différent à chaque tour ;
- `ROTATING_FLEXIBLE` : rotation avec règles de permutation contrôlée ;
- `SAVINGS_POOL` : épargne collective avec décaissement à une date ou condition ;
- `GOAL_BASED_GROUP` : groupe lié à un objectif collectif autorisé ;
- `ORGANIZATION_TONTINE` : tontine interne d’entreprise, association ou organisation ;
- `FAMILY_TONTINE` : cercle familial ;
- `COMMUNITY_TONTINE` : groupe communautaire ;
- `OTHER_ALLOWED` : type activé explicitement par pays et administration.

Les mécanismes assimilables juridiquement à de l’investissement collectif, du crédit rémunéré, des titres financiers ou une activité réglementée différente doivent être exclus du module et routés vers les modules appropriés.

## 4. Acteurs

### 4.1 Créateur

Utilisateur ou organisation à l’origine de la tontine. Il définit le brouillon initial mais ne peut pas rendre effectives des règles incompatibles avec les politiques Mansa.

### 4.2 Administrateur de groupe

Membre disposant de droits de gestion non financiers ou limités : invitations, rappels, propositions de changement, modération du groupe, gestion documentaire. Les actions sensibles restent soumises aux règles et à l’audit.

### 4.3 Membre

Participant ayant accepté les règles de la tontine. Il possède un statut d’adhésion, un calendrier de cotisation, une position dans la rotation et un historique financier.

### 4.4 Bénéficiaire du tour

Membre désigné pour recevoir la distribution d’un cycle donné. Il peut être empêché de recevoir les fonds en cas de contrôle de conformité, fraude, litige, compte bloqué ou KYC insuffisant.

### 4.5 Co-administrateur

Membre optionnel disposant de droits délégués mais jamais d’un pouvoir de réécriture de l’historique financier.

### 4.6 Mansa Admin / Support / Conformité / Fraude

Agents internes soumis au RBAC/ABAC, à la séparation des tâches, au principe du moindre privilège et à l’audit immuable.

## 5. Visibilité et accès

`TontineVisibility` :

- `PRIVATE_INVITE_ONLY` ;
- `ORGANIZATION_ONLY` ;
- `APPROVAL_REQUIRED` ;
- `DISCOVERABLE_RESTRICTED` uniquement si juridiquement autorisé ;
- `PUBLIC_JOIN_REQUEST` uniquement si explicitement activé par pays.

Par défaut, une tontine est privée et accessible sur invitation. Les liens d’invitation doivent être révocables, expirer et ne jamais conférer automatiquement un droit financier sans validation d’adhésion.

## 6. Cycle de vie

`TontineStatus` :

- `DRAFT`
- `PENDING_CONFIGURATION`
- `PENDING_VERIFICATION`
- `PENDING_MEMBERS`
- `READY_TO_START`
- `ACTIVE`
- `PAUSED`
- `SUSPENDED_RISK`
- `COMPLETING`
- `COMPLETED`
- `CANCEL_PENDING`
- `CANCELLED`
- `DISPUTED`
- `ARCHIVED`

Règles de transition :

- aucune activation si le nombre minimum de membres ou les vérifications requises ne sont pas satisfaits ;
- les règles financières sont figées ou versionnées à l’activation ;
- toute modification sensible après activation suit un workflow d’approbation ;
- une suspension de risque peut bloquer les nouvelles cotisations, les distributions ou les deux ;
- l’archivage n’efface aucun événement financier ou preuve obligatoire.

## 7. Création de la tontine

Champs recommandés :

- `name` ;
- `description` ;
- `tontineType` ;
- `creatorUserId` ou `organizationId` ;
- `countryCode` ;
- `currency` ;
- `contributionAmount` ;
- `frequencyType` ;
- `customFrequencyRule` si nécessaire ;
- `memberTargetCount` ;
- `minMemberCount` ;
- `maxMemberCount` ;
- `startDate` ;
- `contributionDueTime` ;
- `gracePeriod` ;
- `rotationMethod` ;
- `visibility` ;
- `latePolicyId` ;
- `replacementPolicyId` ;
- `payoutPolicyId` ;
- `termsVersionAccepted` ;
- `pricingContext` résolu côté serveur ;
- `featureFlagSnapshot` facultatif pour audit fonctionnel.

Le créateur doit visualiser avant publication : le montant par échéance, le nombre de tours, la durée estimée, le montant brut d’un tour, les frais applicables, les moyens de paiement disponibles, les obligations des membres et les règles de retard/sortie.

## 8. Fréquences et calendrier

`ContributionFrequency` :

- `DAILY`
- `WEEKLY`
- `BIWEEKLY`
- `MONTHLY`
- `CUSTOM_SCHEDULE`

Le calendrier doit être généré côté serveur et versionné. Chaque échéance possède :

- un identifiant unique ;
- une date d’ouverture ;
- une date d’échéance ;
- une période de grâce éventuelle ;
- un bénéficiaire de tour ;
- un montant attendu par membre ;
- un montant brut attendu ;
- un état de collecte ;
- un état de distribution ;
- les règles tarifaires applicables ;
- les événements de retard et régularisation.

Une modification de calendrier ne doit jamais supprimer une échéance financière déjà exécutée.

## 9. Ordre de passage

`RotationMethod` :

- `FIXED_ORDER` ;
- `RANDOMIZED_BEFORE_START` ;
- `MEMBER_VOTE_BEFORE_START` ;
- `ADMIN_PROPOSED_MEMBER_APPROVED` ;
- `CUSTOM_ALLOWED_POLICY`.

L’ordre doit être figé à l’activation, sauf cas autorisé : permutation consentie entre membres, remplacement, incident grave, décision de résolution de litige ou règle explicite prévue dès le départ.

Toute modification doit produire :

- ancienne position ;
- nouvelle position ;
- raison ;
- initiateur ;
- approbateurs ;
- horodatage ;
- version de règle ;
- preuve d’acceptation si requise.

## 10. Adhésion d’un membre

Parcours :

1. invitation ou demande d’adhésion ;
2. affichage complet des règles ;
3. contrôle d’éligibilité pays/âge/KYC/limites ;
4. acceptation des conditions ;
5. vérification éventuelle du moyen de paiement ;
6. attribution d’une position provisoire ;
7. approbation par le groupe si requise ;
8. confirmation ;
9. génération du calendrier personnel ;
10. notification.

`MembershipStatus` :

- `INVITED`
- `PENDING_ACCEPTANCE`
- `PENDING_KYC`
- `PENDING_APPROVAL`
- `ACTIVE`
- `LATE_RESTRICTED`
- `SUSPENDED`
- `EXIT_REQUESTED`
- `REPLACEMENT_PENDING`
- `REPLACED`
- `REMOVED`
- `COMPLETED`
- `REJECTED`

Un membre déjà bénéficiaire d’un tour ne doit pas pouvoir quitter le groupe librement si ses obligations futures ne sont pas réglées selon la politique convenue.

## 11. Cotisation

### 11.1 Moyens de paiement possibles

Selon pays, partenaires et feature flags :

- wallet Mansa ;
- Mobile Money ;
- carte bancaire ;
- virement bancaire ;
- mandat/prélèvement autorisé ;
- QR Mansa ;
- autre rail partenaire autorisé.

### 11.2 Parcours

1. résolution de l’échéance ;
2. contrôle du statut membre ;
3. calcul du montant de base ;
4. résolution du pricing ;
5. affichage du montant débité, du montant net affecté à la tontine, des frais, commissions et taxes ;
6. consentement ;
7. authentification adaptée au rail ;
8. création d’une clé d’idempotence ;
9. paiement ;
10. confirmation par événement financier ;
11. écriture ledger ;
12. émission du reçu ;
13. mise à jour de l’échéance et des agrégats ;
14. notification.

`ContributionStatus` :

- `EXPECTED`
- `INITIATED`
- `PENDING_PAYMENT`
- `AUTHORIZED`
- `CONFIRMED`
- `FAILED`
- `LATE`
- `GRACE_PERIOD`
- `WAIVED_BY_POLICY`
- `REFUND_PENDING`
- `REFUNDED`
- `REVERSED`
- `CHARGEBACK`
- `UNDER_REVIEW`

## 12. Cotisation automatique

Fonction activable uniquement si un mandat ou mécanisme partenaire légalement valable existe.

Le membre doit pouvoir :

- voir le mandat ;
- voir la prochaine échéance ;
- modifier le moyen source lorsque permis ;
- recevoir les notifications réglementaires nécessaires ;
- suspendre ou révoquer le mandat selon les règles ;
- consulter toutes les tentatives.

La révocation d’un mandat n’annule pas les obligations contractuelles internes à la tontine ; elle désactive uniquement le mécanisme d’exécution automatique.

## 13. Gestion des retards

`LatePolicy` configurable :

- aucune pénalité ;
- période de grâce ;
- frais fixe ;
- frais proportionnel ;
- restriction temporaire ;
- rappel renforcé ;
- blocage du bénéfice futur jusqu’à régularisation ;
- passage en revue manuelle ;
- procédure de remplacement selon seuil.

Les pénalités doivent être juridiquement autorisées, explicites avant adhésion et calculées par le Pricing Engine lorsqu’elles constituent des frais.

Les retards ne doivent jamais permettre à un administrateur de saisir arbitrairement de l’argent. Toute régularisation passe par une opération financière traçable.

## 14. Distribution au bénéficiaire du tour

Avant distribution :

- vérifier que l’échéance est arrivée au stade autorisé ;
- calculer les cotisations confirmées ;
- traiter les membres en retard selon la politique ;
- contrôler le statut KYC/KYB du bénéficiaire ;
- exécuter les contrôles fraude/AML/sanctions nécessaires ;
- calculer les frais de distribution ;
- vérifier les limites pays et rails ;
- appliquer les réserves ou blocages éventuels ;
- exiger une approbation supplémentaire au-delà de seuils configurables.

`PayoutStatus` :

- `NOT_READY`
- `READY`
- `PENDING_REVIEW`
- `APPROVED`
- `PROCESSING`
- `PARTIALLY_PAID`
- `PAID`
- `FAILED`
- `BLOCKED`
- `REVERSED`
- `CANCELLED`

Une distribution ne doit être marquée `PAID` qu’après confirmation du rail financier ou du ledger central.

## 15. Cas de cotisations incomplètes

La politique doit être définie dès la création :

- attendre tous les membres ;
- autoriser distribution partielle ;
- couvrir temporairement uniquement via un mécanisme partenaire explicitement autorisé ;
- reporter l’échéance ;
- appliquer une réserve ;
- passer en résolution manuelle.

Mansa ne doit jamais avancer automatiquement ses propres fonds sans produit de crédit explicitement autorisé et intégré au module Crédit.

## 16. Remplacement d’un membre

Cas possibles :

- départ volontaire avant démarrage ;
- incapacité persistante à payer ;
- compte fermé ;
- fraude ;
- décès ;
- décision de conformité ;
- décision collective selon règles.

`ReplacementFlow` :

1. ouverture de demande ;
2. calcul des obligations déjà exécutées ;
3. identification des engagements futurs ;
4. proposition d’un remplaçant ;
5. KYC/éligibilité ;
6. acceptation des règles ;
7. validation selon gouvernance ;
8. transfert contrôlé de la position future ;
9. traitement des montants dus ou remboursables ;
10. audit complet.

Aucune écriture historique ne doit être réattribuée rétroactivement au remplaçant.

## 17. Sortie d’un membre

Le système doit distinguer :

- sortie avant activation ;
- sortie avant premier bénéfice ;
- sortie après plusieurs cotisations ;
- sortie après avoir reçu son tour ;
- exclusion pour fraude ;
- exclusion pour non-paiement ;
- décès ou incapacité ;
- fermeture réglementaire.

Les règles de remboursement, dette résiduelle, remplacement et conservation des preuves dépendent de la politique convenue et du droit applicable.

## 18. Gouvernance et décisions collectives

Actions pouvant nécessiter un vote ou consentement :

- modifier une date future ;
- permuter deux tours ;
- remplacer un membre ;
- modifier une règle non financière ;
- suspendre temporairement le groupe ;
- accepter une exception de retard ;
- clôturer anticipativement.

`DecisionStatus` : `PROPOSED`, `VOTING`, `APPROVED`, `REJECTED`, `EXPIRED`, `EXECUTED`, `CANCELLED`.

Le système conserve le quorum, les votes, les abstentions, les règles applicables et le résultat. Les décisions ne peuvent jamais contourner une règle légale, de conformité ou de sécurité Mansa.

## 19. Modèle de données recommandé

### `Tontine`

- `id`
- `name`
- `description`
- `type`
- `status`
- `creatorUserId`
- `organizationId?`
- `countryCode`
- `currency`
- `contributionAmount`
- `frequency`
- `memberTargetCount`
- `startDate`
- `visibility`
- `rotationMethod`
- `currentRuleVersionId`
- `createdAt`
- `updatedAt`

### `TontineRuleVersion`

- `id`
- `tontineId`
- `version`
- `effectiveAt`
- `contributionAmount`
- `frequencyRule`
- `gracePeriod`
- `latePolicyId`
- `replacementPolicyId`
- `payoutPolicyId`
- `pricingContextHash`
- `termsHash`
- `createdBy`
- `approvedBy?`

### `TontineMember`

- `id`
- `tontineId`
- `userId`
- `status`
- `role`
- `joinedAt`
- `rotationPosition`
- `kycLevelSnapshot`
- `receivedTurnAt?`
- `exitAt?`

### `TontineRound`

- `id`
- `tontineId`
- `roundNumber`
- `beneficiaryMemberId`
- `opensAt`
- `dueAt`
- `graceEndsAt?`
- `expectedGrossAmount`
- `confirmedGrossAmount`
- `payoutStatus`
- `status`

### `TontineContribution`

- `id`
- `tontineId`
- `roundId`
- `memberId`
- `paymentIntentId`
- `amountBase`
- `feeAmount`
- `taxAmount`
- `totalCharged`
- `netAllocated`
- `status`
- `pricingSnapshotId`
- `idempotencyKey`
- `confirmedAt?`

### `TontinePayout`

- `id`
- `tontineId`
- `roundId`
- `beneficiaryMemberId`
- `grossAmount`
- `feeAmount`
- `taxAmount`
- `netAmount`
- `railType`
- `partnerReference?`
- `status`
- `pricingSnapshotId`

### `TontineDecision`

- `id`
- `tontineId`
- `type`
- `status`
- `proposedBy`
- `payload`
- `quorumRule`
- `approvedAt?`

### `TontineAuditEvent`

Référence vers l’audit central : acteur, action, ressource, version avant/après, motif, canal, device, IP tronquée ou autre donnée minimisée selon politique, correlationId, timestamp.

## 20. Ledger et comptabilité

Objets logiques :

- wallet source du membre ou compte de règlement partenaire ;
- compte technique de collecte tontine ;
- sous-ledger par tontine ;
- sous-ledger par round ;
- compte de frais Mansa ;
- compte de commission partenaire ;
- compte agent/commerçant/apporteur si applicable ;
- compte taxes ;
- compte suspense ;
- compte réserve litige ;
- compte de distribution bénéficiaire ;
- compte de remboursement.

Métriques recommandées :

- `expectedContributionsAmount` ;
- `confirmedContributionsAmount` ;
- `pendingContributionsAmount` ;
- `lateContributionsAmount` ;
- `feesAmount` ;
- `taxAmount` ;
- `availableForPayout` ;
- `reservedAmount` ;
- `paidOutAmount` ;
- `refundedAmount` ;
- `reversedAmount`.

Chaque mouvement doit conserver un lien vers l’événement métier d’origine.

## 21. Pricing & Commission Engine

Aucun tarif ne doit être inscrit directement dans le code du module.

Le moteur central doit pouvoir calculer, selon contexte :

- frais fixe ;
- frais en pourcentage ;
- fixe + pourcentage ;
- minimum ;
- maximum ;
- paliers de volume ;
- gratuité ;
- nombre d’opérations gratuites ;
- promotions ;
- pays ;
- devise ;
- canal ;
- type d’utilisateur ;
- type de tontine ;
- partenaire ;
- rail ;
- volume ;
- commission Mansa ;
- commission agent ;
- commission commerçant ;
- commission partenaire ;
- commission apporteur ;
- taxes séparées ;
- date d’effet ;
- date de fin.

Le module doit demander au moteur un `PricingQuote` avant confirmation. Ce devis comporte :

- `quoteId` ;
- `pricingRuleVersion` ;
- montant de base ;
- détail des frais ;
- taxes ;
- commissions ;
- montant total débité ;
- montant net crédité ;
- expiration du devis.

Une transaction exécutée conserve un `PricingSnapshot` immuable. Une modification ultérieure des tarifs ne doit jamais altérer les opérations historiques.

Workflow Admin recommandé : `DRAFT -> SIMULATED -> PENDING_APPROVAL -> SCHEDULED -> ACTIVE -> EXPIRED/REVOKED`.

Les changements sensibles doivent supporter séparation des rôles, double approbation configurable, simulation d’impact et audit.

## 22. RBAC / ABAC

Permissions indicatives :

- `tontine.create`
- `tontine.read`
- `tontine.invite_member`
- `tontine.approve_member`
- `tontine.manage_nonfinancial_settings`
- `tontine.propose_rule_change`
- `tontine.vote`
- `tontine.pay_contribution`
- `tontine.request_exit`
- `tontine.request_replacement`
- `tontine.view_financial_history`
- `tontine.admin.pause`
- `tontine.admin.suspend`
- `tontine.admin.resolve_dispute`
- `tontine.compliance.review`
- `tontine.fraud.review`
- `tontine.pricing.read`

ABAC doit considérer au minimum : pays, statut KYC/KYB, rôle dans la tontine, statut du groupe, statut du round, montant, canal, device trust, partenaire, feature flags, sanctions/risque, propriété de la ressource et heure/date d’effet.

## 23. API recommandée

Routes indicatives, à adapter à l’architecture existante :

- `POST /tontines`
- `GET /tontines`
- `GET /tontines/:id`
- `PATCH /tontines/:id`
- `POST /tontines/:id/invitations`
- `POST /tontines/:id/join`
- `POST /tontines/:id/members/:memberId/approve`
- `GET /tontines/:id/members`
- `GET /tontines/:id/rounds`
- `GET /tontines/:id/rounds/:roundId`
- `POST /tontines/:id/rounds/:roundId/contributions/quote`
- `POST /tontines/:id/rounds/:roundId/contributions`
- `GET /tontines/:id/contributions`
- `GET /tontines/:id/payouts`
- `POST /tontines/:id/decisions`
- `POST /tontines/:id/decisions/:decisionId/votes`
- `POST /tontines/:id/replacements`
- `POST /tontines/:id/exit-requests`
- `POST /tontines/:id/pause`
- `POST /tontines/:id/resume`
- `POST /tontines/:id/report`

Toutes les routes financières nécessitent idempotency key, correlationId, contrôle d’autorisation, validation du contexte tarifaire et audit.

## 24. Webhooks et événements

Événements métier :

- `tontine.created`
- `tontine.ready`
- `tontine.started`
- `tontine.paused`
- `tontine.suspended`
- `tontine.completed`
- `tontine.member.invited`
- `tontine.member.joined`
- `tontine.member.replaced`
- `tontine.round.opened`
- `tontine.round.due`
- `tontine.contribution.confirmed`
- `tontine.contribution.late`
- `tontine.payout.ready`
- `tontine.payout.paid`
- `tontine.payout.failed`
- `tontine.decision.proposed`
- `tontine.decision.approved`
- `tontine.dispute.opened`

Les webhooks externes doivent être signés, versionnés, rejouables, idempotents et disposer d’une dead-letter queue.

## 25. Feature flags

Exemples :

- `tontine.enabled`
- `tontine.country.<CC>.enabled`
- `tontine.recurring_debit.enabled`
- `tontine.public_join.enabled`
- `tontine.custom_schedule.enabled`
- `tontine.member_voting.enabled`
- `tontine.partial_payout.enabled`
- `tontine.mobile_money.enabled`
- `tontine.card.enabled`
- `tontine.bank_transfer.enabled`
- `tontine.organization.enabled`

Les flags doivent pouvoir être ciblés par pays, environnement, type d’organisation, partenaire, cohorte et date d’effet.

## 26. Administration

Le portail Admin doit permettre :

- rechercher une tontine ;
- consulter son statut et son historique ;
- voir les membres et leurs statuts ;
- voir rounds, cotisations, retards, distributions et anomalies ;
- mettre en pause ou suspendre selon permission ;
- déclencher une revue conformité/fraude ;
- gérer les plafonds et règles pays ;
- gérer feature flags ;
- consulter les règles tarifaires résolues ;
- simuler un nouveau tarif ;
- approuver/programmer un tarif ;
- traiter les litiges ;
- exporter les éléments autorisés ;
- consulter le journal d’audit.

Aucune interface Admin ne doit offrir un bouton permettant de modifier directement un solde financier.

## 27. Notifications

Notifications possibles :

- invitation ;
- adhésion acceptée ;
- tontine prête à démarrer ;
- échéance à venir ;
- cotisation due ;
- cotisation réussie ;
- cotisation échouée ;
- retard ;
- fin de période de grâce ;
- tour prochain ;
- distribution initiée ;
- distribution reçue ;
- proposition de décision ;
- résultat de vote ;
- remplacement ;
- suspension ;
- clôture.

Canaux activables : push, in-app, e-mail, SMS ou autres canaux partenaires. Les préférences utilisateur s’appliquent sauf notifications obligatoires légalement ou nécessaires à la sécurité.

## 28. Fraude et risques

Signaux possibles :

- plusieurs comptes liés au même device ou identité ;
- invitations massives inhabituelles ;
- cycles de fonds suspects ;
- membre qui reçoit tôt puis cesse systématiquement de cotiser ;
- tentatives répétées de changement de bénéficiaire ;
- changements de moyen de paiement juste avant distribution ;
- comptes récemment créés avec montants élevés ;
- chargebacks multiples ;
- activité transfrontalière incohérente ;
- utilisation de comptes tiers ;
- volume anormal par rapport au profil.

Actions possibles :

- friction supplémentaire ;
- authentification renforcée ;
- baisse temporaire de limite ;
- mise en revue ;
- blocage de distribution ;
- suspension ciblée ;
- demande de justificatifs ;
- investigation conformité/fraude.

Les règles de fraude ne doivent pas être visibles dans un niveau de détail permettant leur contournement.

## 29. Conformité et KYC/KYB

Le niveau de contrôle dépend :

- du pays ;
- du montant ;
- du nombre de tontines actives ;
- du rôle du membre ;
- de la fréquence ;
- du volume cumulé ;
- du type de groupe ;
- du statut personne physique/organisation ;
- du rail utilisé ;
- du niveau de risque.

Le module doit permettre d’imposer un KYC plus élevé avant réception d’un tour que pour une simple consultation ou adhésion.

Les contrôles réglementaires précis doivent rester paramétrables et être validés juridiquement avant production dans chaque pays.

## 30. Multi-pays et multi-devises

Chaque tontine possède une devise de référence. Une conversion ne doit pas être implicite.

Si les contributions multi-devises sont autorisées à terme :

- afficher le taux avant confirmation ;
- afficher la marge et les frais ;
- verrouiller le devis pendant une durée courte ;
- conserver le taux appliqué ;
- conserver le montant source et le montant crédité ;
- gérer les écarts de règlement ;
- respecter les restrictions de change et de transfert transfrontalier.

Par défaut, un groupe devrait fonctionner dans une seule devise afin de simplifier la compréhension et le règlement.

## 31. Réseau faible et hors ligne

Le module peut mettre en cache localement :

- liste des tontines ;
- calendrier ;
- règles non sensibles ;
- derniers statuts confirmés ;
- reçus déjà synchronisés.

Une opération financière ne doit jamais être considérée réussie uniquement parce que l’interface locale l’affiche. En cas de réseau faible :

- créer une intention locale avec identifiant stable si l’architecture le permet ;
- synchroniser avec clé d’idempotence ;
- afficher `PENDING_SYNC` ou statut équivalent ;
- attendre confirmation serveur/rail ;
- empêcher le double clic et les doubles soumissions ;
- réconcilier automatiquement après reconnexion.

## 32. Sécurité

Exigences :

- authentification forte selon risque ;
- chiffrement en transit et au repos ;
- secrets uniquement dans gestionnaire dédié ;
- signatures des webhooks ;
- contrôle anti-rejeu ;
- idempotence ;
- rate limiting ;
- device binding lorsque pertinent ;
- sessions révocables ;
- audit immuable ;
- séparation des privilèges ;
- validation stricte des entrées ;
- protection contre IDOR/BOLA ;
- contrôle des exports ;
- journalisation sans données sensibles inutiles.

## 33. Données et rétention

Le module doit classifier :

- données de profil ;
- données d’adhésion ;
- données financières ;
- preuves de consentement ;
- décisions de groupe ;
- documents KYC/KYB ;
- événements de sécurité ;
- journaux d’audit.

Chaque catégorie suit la politique centrale de rétention Mansa. Les données financières et preuves réglementaires ne doivent pas être supprimées simplement à la demande si une obligation légale impose leur conservation.

L’utilisateur doit pouvoir exporter les données exportables autorisées dans un format lisible avant suppression de données éligibles.

## 34. Observabilité et résilience

Métriques :

- tontines actives ;
- taux d’adhésion ;
- rounds ouverts ;
- cotisations attendues/confirmées ;
- taux de retard ;
- taux d’échec paiement ;
- temps moyen de confirmation ;
- distributions réussies/échouées ;
- volume financier ;
- frais et commissions ;
- litiges ;
- suspensions fraude ;
- erreurs par partenaire.

Le service doit supporter retries contrôlés, circuit breakers, files d’événements, dead-letter queues, réconciliation périodique et procédures de reprise.

## 35. Réconciliation

Des jobs de réconciliation doivent comparer :

- intentions Mansa ;
- écritures ledger ;
- statuts partenaires ;
- relevés de règlement ;
- montants attendus par round ;
- distributions ;
- remboursements ;
- frais et commissions.

Toute différence produit un `ReconciliationCase` avec statut, montant, partenaire, cause supposée, propriétaire opérationnel et piste d’audit.

## 36. Litiges

`DisputeType` :

- contribution contestée ;
- retard contesté ;
- ordre de passage contesté ;
- remplacement contesté ;
- distribution non reçue ;
- erreur de montant ;
- fraude présumée ;
- fermeture anticipée ;
- autre litige autorisé.

Workflow : `OPEN -> TRIAGED -> EVIDENCE_REQUESTED -> UNDER_REVIEW -> RESOLVED -> APPEAL_ALLOWED/FINAL`.

Une résolution peut entraîner correction comptable via écriture compensatrice, mais jamais modification ou suppression rétroactive d’une écriture historique.

## 37. Tests fonctionnels minimums

- création tontine valide/invalide ;
- invitation et expiration ;
- adhésion avec KYC insuffisant ;
- génération calendrier ;
- ordre de passage ;
- cotisation réussie ;
- échec rail ;
- double soumission idempotente ;
- retard et période de grâce ;
- pénalité tarifaire ;
- distribution ;
- distribution partielle si activée ;
- blocage fraude ;
- remplacement ;
- sortie avant/après bénéfice ;
- vote ;
- suspension ;
- remboursement ;
- changement de pricing futur sans impact historique ;
- multi-pays ;
- feature flags ;
- reprise réseau ;
- réconciliation.

## 38. Tests sécurité

- BOLA/IDOR entre tontines ;
- élévation de privilège admin groupe ;
- falsification d’ordre de passage ;
- altération de montant ;
- rejeu de paiement ;
- webhooks falsifiés ;
- double payout ;
- contournement KYC ;
- modification pricing côté client ;
- injection ;
- rate-limit bypass ;
- fuite de documents ;
- accès à un groupe privé ;
- tentative de modification du ledger.

## 39. Tests performance

Scénarios :

- milliers de groupes actifs ;
- pics d’échéance mensuelle ;
- batch de rappels ;
- milliers de cotisations simultanées ;
- génération de calendriers ;
- payout de nombreux rounds ;
- réconciliation partenaire ;
- lecture d’historique long.

Objectifs chiffrés doivent être définis par environnement et capacité partenaire, pas codés arbitrairement dans ce document.

## 40. Ordre de développement recommandé

1. modèles de domaine et règles de cycle de vie ;
2. ledger et contrats financiers partagés ;
3. création/adhésion/membres ;
4. calendrier et rounds ;
5. cotisations ;
6. Pricing Engine integration ;
7. distributions ;
8. retards et remplacements ;
9. gouvernance/votes ;
10. conformité/fraude ;
11. Admin ;
12. notifications ;
13. webhooks/API partenaires ;
14. réconciliation ;
15. observabilité ;
16. tests sécurité/performance/résilience ;
17. activation progressive par feature flags.

## 41. Critères d’acceptation

Le module est considéré suffisamment spécifié lorsque :

- une tontine complète peut être créée, validée, démarrée et terminée ;
- chaque membre possède un statut, un calendrier et une position de rotation ;
- les cotisations sont idempotentes et liées au ledger ;
- les distributions ne peuvent pas être dupliquées ;
- les retards et remplacements suivent des workflows explicites ;
- les règles financières sont versionnées ;
- le pricing est entièrement configurable sans modification de code ;
- les frais appliqués à une transaction passée restent immuables ;
- les permissions empêchent un administrateur de groupe de manipuler les soldes ;
- les règles pays, devises, rails et plafonds sont configurables ;
- les intégrations partenaires restent abstraites ;
- les événements critiques sont audités ;
- les contrôles fraude/KYC peuvent bloquer un payout ;
- les feature flags permettent un déploiement progressif ;
- les tests couvrent fonctionnel, sécurité, performance, résilience et réconciliation ;
- aucun secret réel, identifiant bancaire réel ou dépendance partenaire non contractée n’est requis dans le dépôt.

## 42. Hors périmètre immédiat

À ne pas confondre avec ce module :

- crédit entre membres ;
- intérêts ou rendement garanti ;
- investissement collectif réglementé ;
- assurance tontine ;
- produits de retraite ;
- marché secondaire de positions ;
- cession commerciale d’un tour ;
- avance de trésorerie Mansa.

Ces fonctions nécessitent des modules et validations réglementaires distincts.

## 43. Résultat attendu

Mansa doit fournir une tontine numérique compréhensible, traçable et configurable qui respecte les usages de groupe tout en empêchant les manipulations invisibles. Le produit doit rester adaptable aux règles de chaque pays, aux partenaires disponibles et au modèle économique Mansa, avec une gestion centralisée des frais et commissions et une séparation claire entre logique sociale de la tontine, exécution financière, conformité et administration.
