# Parrainage, invitations, acquisition organique et croissance contrôlée

## 1. Objet

Ce document définit le cahier des charges Mansa pour les mécanismes de parrainage, d’invitation, de codes promotionnels liés à l’acquisition, de campagnes de croissance organique, de récompenses d’activation et de mesure de leur performance.

L’objectif est de permettre à Mansa de développer son nombre d’utilisateurs, de commerçants, d’agents et de partenaires sans créer de vulnérabilité fraude, de dette promotionnelle incontrôlée, de récompenses non explicables ou de dépendance à un canal unique.

Le module doit être multi-pays, multi-produit, multi-organisation et compatible avec les exigences KYC, lutte contre la fraude, tarification, fidélité, notifications, analytics et configuration déjà prévues dans la plateforme.

## 2. Principes obligatoires

- aucun bonus n’est versé uniquement parce qu’un lien a été cliqué ;
- l’attribution d’une récompense dépend d’événements vérifiables côté serveur ;
- les conditions d’éligibilité sont versionnées, datées et auditables ;
- une même identité ne doit pas pouvoir obtenir plusieurs bonus via plusieurs comptes artificiels ;
- le parrain et le filleul peuvent être soumis à des règles différentes ;
- toute campagne possède une date de début, une date de fin ou une règle d’arrêt explicite ;
- le coût maximum théorique d’une campagne doit être calculable avant publication ;
- les récompenses peuvent être financières ou non financières ;
- les récompenses financières passent par le ledger et ne sont jamais créées seulement côté client ;
- les règles peuvent varier selon pays, segment, produit, organisation, canal et statut KYC ;
- les campagnes doivent pouvoir être suspendues immédiatement en cas de fraude ou de dérive budgétaire ;
- aucun bonus ne doit permettre de contourner des limites réglementaires, KYC, AML/CFT ou de risque ;
- le système doit distinguer clairement acquisition réelle, réactivation, invitation interne et promotion commerciale.

## 3. Périmètre

Le module couvre notamment :

```text
invitation utilisateur → utilisateur
parrainage utilisateur → utilisateur
invitation commerçant
parrainage commerçant
parrainage agent
invitation entreprise
invitation administration/organisation
campagnes d’activation
campagnes de réactivation
bonus première transaction
bonus premier paiement marchand
bonus premier dépôt/cash-in
bonus premier transfert éligible
récompenses non monétaires
codes d’invitation
liens profonds/deep links
QR d’invitation
attribution multi-canal
anti-fraude promotionnelle
budget campagne
analytics acquisition
```

## 4. Hors périmètre

Ce document ne remplace pas :

- le moteur général de fidélité/cashback ;
- le moteur de tarification ;
- le moteur de risque transactionnel ;
- le KYC/KYB ;
- le système de notifications ;
- le moteur de fraude général.

Il s’intègre à ces modules et réutilise leurs décisions.

## 5. Entités principales

Entités recommandées :

```text
ReferralProgram
ReferralCampaign
ReferralRule
ReferralRuleVersion
ReferralCode
ReferralLink
ReferralInvitation
ReferralAttribution
ReferralParticipant
ReferralQualification
ReferralReward
ReferralRewardLedgerEntry
ReferralBudget
ReferralFraudSignal
ReferralReview
ReferralDispute
ReferralAuditLog
ReferralAnalyticsSnapshot
```

## 6. Types de participants

Le système doit supporter au minimum :

```text
CONSUMER
MERCHANT
AGENT
BUSINESS
EMPLOYEE
STATE_ORGANIZATION
PARTNER
DEVELOPER_PARTNER
```

Une campagne peut autoriser un seul type de parrain et un seul type de filleul, ou une combinaison explicite.

Exemples :

```text
CONSUMER → CONSUMER
MERCHANT → MERCHANT
AGENT → CONSUMER
BUSINESS → EMPLOYEE
PARTNER → MERCHANT
```

## 7. Programme vs campagne

`ReferralProgram` définit le cadre durable d’un produit.

`ReferralCampaign` définit une opération commerciale limitée ou versionnée.

Exemple :

```text
Programme : Parrainage clients Mali
Campagne : Rentrée septembre 2026
```

Le programme peut rester actif tandis que plusieurs campagnes se succèdent.

## 8. Codes d’invitation

Un code doit être :

- non sensible ;
- difficile à deviner massivement ;
- unique dans la portée prévue ;
- révocable ;
- traçable ;
- éventuellement expirant ;
- indépendant des identifiants internes bruts.

Exemple :

```text
MNS-Z7K4P2
```

Le système ne doit jamais exposer directement un `userId`, un numéro de session ou une clé interne dans un code public.

## 9. Liens d’invitation

Un lien peut contenir :

```text
campaign_id
referral_code
country_hint
channel
utm_source
utm_medium
utm_campaign
```

Le lien ne doit contenir ni secret, ni token d’authentification, ni donnée KYC.

Les liens doivent fonctionner avec :

- application installée ;
- application non installée ;
- web ;
- QR ;
- SMS ;
- messagerie ;
- email ;
- partage système mobile.

## 10. Attribution

L’attribution relie un nouveau participant à une invitation.

États possibles :

```text
CAPTURED
PENDING
QUALIFIED
REJECTED
EXPIRED
REVOKED
REVIEW_REQUIRED
```

Une attribution doit enregistrer :

- campagne ;
- parrain ;
- filleul ;
- code/lien ;
- canal ;
- date de capture ;
- date de qualification ;
- règle/version ;
- raison d’acceptation ou rejet ;
- éventuels signaux de fraude.

## 11. Fenêtre d’attribution

Une campagne peut définir une fenêtre :

```text
24 heures
7 jours
30 jours
jusqu’à inscription
jusqu’à première transaction
```

La durée doit être explicite et versionnée.

Une ancienne invitation expirée ne doit pas reprendre automatiquement priorité après une nouvelle campagne.

## 12. Politique d’attribution multiple

Si plusieurs parrains revendiquent le même filleul, la politique doit être définie :

```text
FIRST_TOUCH
LAST_TOUCH
EXPLICIT_CODE_PRIORITY
ACCOUNT_CREATION_CODE
NO_REASSIGNMENT_AFTER_SIGNUP
```

Pour limiter les litiges, le comportement recommandé est de verrouiller l’attribution après la création du compte ou après une étape définie.

## 13. Conditions de qualification

Une récompense peut dépendre de plusieurs conditions :

- compte créé ;
- téléphone/email vérifié ;
- KYC minimal ou complet ;
- compte non dupliqué ;
- première transaction réussie ;
- montant minimum ;
- transaction non remboursée ;
- délai anti-fraude écoulé ;
- premier paiement marchand ;
- première utilisation carte ;
- premier cash-in ;
- activité pendant N jours ;
- commerçant activé ;
- agent validé ;
- terminal réellement utilisé.

Les conditions sont évaluées côté backend à partir d’événements de confiance.

## 14. Qualification différée

Une campagne peut prévoir :

```text
T0 : inscription
T1 : KYC
T2 : première transaction
T3 : délai de sécurité
T4 : récompense
```

Le versement différé réduit le risque de fraude et d’annulation immédiate.

## 15. Types de récompenses

Récompenses possibles :

```text
CASH
WALLET_CREDIT
FEE_DISCOUNT
FEE_WAIVER
CASHBACK_BOOST
LOYALTY_POINTS
VOUCHER
MERCHANT_COUPON
FREE_TRANSFER
FREE_CARD_DELIVERY
SUBSCRIPTION_DISCOUNT
NON_MONETARY_BADGE
PARTNER_BENEFIT
```

Les récompenses monétaires et quasi-monétaires doivent être comptabilisées avec une origine budgétaire claire.

## 16. Récompense du parrain

Le parrain peut recevoir :

- montant fixe ;
- pourcentage plafonné ;
- bonus après N filleuls qualifiés ;
- bonus par palier ;
- avantage temporaire ;
- points ;
- réduction de frais.

Exemple :

```text
1 filleul qualifié → 500 XOF
5 filleuls qualifiés → bonus supplémentaire
10 filleuls qualifiés → palier supérieur
```

Les montants ne sont jamais codés en dur dans l’application.

## 17. Récompense du filleul

Le filleul peut recevoir :

- crédit de bienvenue ;
- réduction première opération ;
- cashback initial ;
- frais offerts ;
- avantage marchand ;
- livraison carte offerte ;
- bonus après KYC et première transaction.

La campagne peut ne récompenser qu’un seul côté.

## 18. Budget campagne

Toute campagne financière doit posséder un budget ou une limite contrôlable.

Champs :

```text
budget_total
budget_committed
budget_paid
budget_remaining
max_daily_spend
max_reward_count
max_reward_per_referrer
max_reward_per_referred
```

Le système doit pouvoir refuser de nouvelles récompenses lorsque le budget est épuisé.

## 19. Réservation budgétaire

Pour certaines campagnes, une récompense peut être réservée avant paiement final :

```text
ELIGIBLE
→ RESERVED
→ PAYABLE
→ PAID
```

En cas de fraude ou d’annulation :

```text
RESERVED → RELEASED
```

Cela évite de dépasser le budget lors de pics d’activité.

## 20. Comptabilisation

Toute récompense monétaire doit créer une écriture auditable.

Exemple logique :

```text
Compte marketing campagne
→ wallet bénéficiaire
```

Le ledger conserve :

- référence campagne ;
- bénéficiaire ;
- montant ;
- devise ;
- règle ;
- source budgétaire ;
- idempotency key ;
- statut ;
- éventuelle annulation comptable.

Aucune modification directe du solde utilisateur n’est permise.

## 21. Idempotence

L’événement de qualification doit produire une clé d’idempotence stable.

Exemple :

```text
referral:{campaignId}:{participantId}:{rewardType}
```

Une relivraison d’événement ne doit jamais produire deux bonus.

## 22. Fraude — multi-comptes

Signaux minimaux :

- même document d’identité ;
- même téléphone réutilisé ;
- même appareil ;
- même empreinte appareil ;
- comptes créés en rafale ;
- adresses/IP anormales ;
- même moyen de paiement ;
- transferts circulaires ;
- transactions artificielles ;
- remboursement immédiat ;
- activité entre comptes liés ;
- réseau de parrainage anormalement dense.

Aucun signal isolé ne doit automatiquement condamner un utilisateur sans politique définie, mais il peut bloquer ou retarder une récompense.

## 23. Fraude — auto-parrainage

Le système doit détecter autant que possible :

```text
même identité
même téléphone
même appareil
même moyen de paiement
même document
même bénéficiaire économique
```

L’auto-parrainage peut être interdit par défaut pour les campagnes grand public.

## 24. Fraude — fermes de comptes

Le moteur de risque doit pouvoir détecter :

- création massive ;
- séquences d’actions identiques ;
- comptes dormants après bonus ;
- transactions minimales répétitives ;
- chaînes de parrainage artificielles ;
- groupes d’appareils liés ;
- schémas géographiques incohérents.

Une campagne peut être automatiquement mise en pause si un seuil est dépassé.

## 25. Délai de sécurité

Une récompense peut rester en statut :

```text
PENDING_RISK_REVIEW
```

pendant une durée configurable avant crédit final.

Ce délai doit rester raisonnable et explicable au support.

## 26. Plafonds par utilisateur

Exemples de limites configurables :

```text
max_referrals_per_day
max_referrals_per_month
max_rewards_per_month
max_reward_value_per_month
max_lifetime_reward
```

Les plafonds peuvent dépendre du segment et du statut KYC.

## 27. Parrainage commerçants

Une campagne commerçant peut exiger :

- KYB validé ;
- boutique activée ;
- premier paiement réel ;
- volume minimum ;
- absence d’auto-paiement ;
- période d’activité minimum.

Le bonus peut être payé au commerçant parrain, au nouveau commerçant, ou aux deux.

## 28. Parrainage agents

Pour les agents, les conditions doivent être plus strictes afin d’éviter les créations fictives.

Exigences possibles :

- agent contractuellement actif ;
- nouveau client KYC ;
- première opération réelle ;
- exclusion des comptes déjà existants ;
- contrôle de zone ;
- analyse des transactions entre agent et comptes liés.

Les commissions normales d’agent restent distinctes des bonus de parrainage.

## 29. Entreprises et employés

Une entreprise peut inviter ses employés ou collaborateurs sans que cela soit nécessairement un parrainage rémunéré.

Cas :

```text
invitation à rejoindre une organisation
invitation à recevoir un salaire
invitation à utiliser une carte entreprise
invitation à activer un wallet professionnel
```

Ces invitations doivent être séparées des campagnes marketing grand public.

## 30. État et organisations publiques

Les administrations peuvent inviter des bénéficiaires à activer un service sans mécanisme de récompense commerciale.

Exemples :

- bourse ;
- carte étudiante ;
- service administratif ;
- paiement public ;
- compte bénéficiaire.

Le module d’invitation doit donc fonctionner avec `reward = NONE`.

Aucune campagne marketing ne doit être activée sur une population publique sensible sans validation explicite de gouvernance.

## 31. Canaux de partage

Le produit peut proposer :

```text
copier le lien
SMS
WhatsApp ou messagerie compatible
email
QR
partage natif iOS/Android
mini-site commerçant
réseaux sociaux autorisés
```

L’application ne doit jamais envoyer automatiquement des messages à des contacts sans action explicite de l’utilisateur.

## 32. Contacts et confidentialité

Si l’utilisateur choisit d’accéder à ses contacts :

- demander une permission claire ;
- ne pas uploader tout le carnet par défaut ;
- minimiser les données ;
- permettre le partage via le système natif ;
- respecter les exigences de consentement locales.

Le parrainage doit rester utilisable sans donner accès au carnet d’adresses.

## 33. Deep links

Le deep link doit permettre :

```text
lien → app installée → écran inscription
lien → app absente → store/web → installation → attribution restaurée
```

La restauration doit utiliser un mécanisme sûr et ne jamais reposer sur un secret exposé dans l’URL.

## 34. QR d’invitation

Le QR peut encoder un lien public signé ou un identifiant opaque.

Usages :

- affichage dans l’app ;
- commerçant ;
- agent ;
- événement ;
- stand ;
- affiche marketing.

Les QR statiques de campagne doivent pouvoir être révoqués.

## 35. Campagnes géographiques

Une campagne peut être limitée par :

- pays ;
- région ;
- ville ;
- réseau d’agents ;
- groupe de commerçants ;
- organisation ;
- canal.

La géolocalisation précise ne doit être exigée que si elle est réellement nécessaire.

## 36. Multi-pays et devises

Le moteur doit distinguer les budgets par devise.

Une campagne Mali en XOF ne doit pas automatiquement s’appliquer à un pays voisin.

Les règles de conversion ne doivent pas transformer un bonus local en dette multi-devises implicite.

## 37. Tarification et frais

Le module utilise le moteur de pricing pour :

- frais offerts ;
- réduction temporaire ;
- coupon de frais ;
- cashback promotionnel ;
- subvention.

Une campagne ne modifie pas directement les tarifs de base.

## 38. Fidélité

Les points ou multiplicateurs sont créés via le moteur de fidélité.

Le parrainage peut déclencher une règle de fidélité mais ne doit pas maintenir un second solde de points parallèle.

## 39. Notifications

Notifications possibles :

```text
invitation envoyée
filleul inscrit
condition restante
récompense en attente
récompense accordée
récompense refusée
campagne expirée
plafond atteint
```

Aucune notification ne doit révéler des données sensibles sur le filleul.

Exemple acceptable :

```text
Votre invitation a été validée.
```

Éviter d’exposer le statut KYC détaillé d’un autre utilisateur.

## 40. Expérience utilisateur

L’interface doit afficher avant partage :

- avantage potentiel ;
- conditions principales ;
- date limite si applicable ;
- nombre maximal si applicable ;
- lien vers conditions détaillées.

Il faut éviter les formulations trompeuses du type « argent garanti » si plusieurs conditions s’appliquent.

## 41. Page parrainage utilisateur

Contenu recommandé :

```text
Votre code
Votre lien
Partager
QR
Récompense possible
Progression
Invitations qualifiées
Récompenses obtenues
Conditions
```

L’historique doit distinguer :

```text
EN ATTENTE
QUALIFIÉ
RÉCOMPENSÉ
EXPIRÉ
REFUSÉ
```

## 42. Progression

Pour préserver la confidentialité, afficher des étapes génériques :

```text
Invitation reçue
Inscription effectuée
Conditions en cours
Récompense validée
```

Ne pas afficher des détails internes de risque ou KYC d’un tiers.

## 43. Back-office

Le portail administrateur doit permettre :

- créer campagne ;
- dupliquer campagne ;
- prévisualiser ;
- versionner ;
- programmer ;
- mettre en pause ;
- clôturer ;
- suivre budget ;
- suivre fraude ;
- consulter récompenses ;
- annuler une récompense selon procédure ;
- exporter statistiques ;
- consulter audit.

## 44. Gouvernance des changements

Les modifications sensibles peuvent nécessiter double validation :

- montant récompense ;
- budget ;
- critères d’éligibilité ;
- pays ;
- plafonds ;
- durée ;
- segment ciblé.

Une campagne déjà publiée conserve la version ayant produit chaque décision historique.

## 45. Prévisualisation budgétaire

Avant publication, le système doit estimer :

```text
coût minimum
coût attendu
coût maximum théorique
nombre maximum de récompenses
```

Une alerte doit apparaître si la configuration permet un engagement supérieur au budget prévu.

## 46. Analytics

Indicateurs :

```text
invitations créées
liens partagés
clics
installations attribuées
inscriptions
KYC complétés
filleuls qualifiés
récompenses payées
coût acquisition
fraude détectée
conversion par canal
conversion par campagne
rétention D7/D30/D90
volume transactionnel post-acquisition
```

## 47. Mesure incrémentale

Le système doit permettre d’éviter de confondre acquisition naturelle et effet réel du bonus.

Méthodes possibles :

- groupes témoins ;
- campagnes limitées ;
- comparaison cohortes ;
- périodes de référence ;
- attribution contrôlée.

Les décisions commerciales importantes ne doivent pas reposer uniquement sur le nombre brut d’inscriptions.

## 48. Coût d’acquisition

Calcul recommandé :

```text
CAC campagne =
(récompenses + coûts campagne + coûts partenaires attribués)
/ nouveaux utilisateurs réellement qualifiés
```

Le tableau de bord doit distinguer coût engagé et coût effectivement payé.

## 49. Rétention

Le module doit mesurer si les utilisateurs acquis restent actifs.

Une campagne qui génère beaucoup de comptes mais presque aucune activité durable doit être identifiable comme peu performante.

## 50. Litiges

Cas possibles :

- code non pris en compte ;
- mauvais parrain attribué ;
- récompense manquante ;
- récompense annulée ;
- campagne expirée ;
- qualification contestée.

Le support doit disposer d’un historique de décision sans pouvoir modifier arbitrairement les preuves.

## 51. Corrections manuelles

Une correction manuelle exige :

- motif ;
- opérateur ;
- rôle autorisé ;
- référence dossier ;
- ancienne décision ;
- nouvelle décision ;
- impact financier ;
- audit.

Au-dessus d’un seuil, une deuxième approbation peut être obligatoire.

## 52. Sécurité

Contrôles minimaux :

- rate limiting sur validation de codes ;
- codes non séquentiels ;
- validation serveur ;
- protection replay ;
- idempotence ;
- contrôle d’accès back-office ;
- séparation des rôles ;
- journal d’audit ;
- détection automatisée de fraude ;
- aucun secret dans les liens ;
- aucun détail de fraude exposé au client.

## 53. API

Endpoints possibles :

```text
POST /referrals/invitations
GET  /referrals/me
POST /referrals/resolve
GET  /referrals/campaigns/active
GET  /referrals/rewards
POST /admin/referrals/campaigns
POST /admin/referrals/campaigns/:id/publish
POST /admin/referrals/campaigns/:id/pause
GET  /admin/referrals/analytics
```

Les noms définitifs doivent suivre les conventions globales API Mansa.

## 54. Événements

Événements recommandés :

```text
referral.invitation.created
referral.attribution.captured
referral.participant.registered
referral.qualification.pending
referral.qualification.approved
referral.qualification.rejected
referral.reward.reserved
referral.reward.paid
referral.reward.reversed
referral.campaign.paused
referral.fraud.flagged
```

Les consommateurs doivent être idempotents.

## 55. Modèle de données minimal

Exemple conceptuel :

```text
ReferralCampaign
- id
- countryCode
- participantTypeFrom
- participantTypeTo
- status
- startsAt
- endsAt
- budgetId
- ruleVersionId

ReferralAttribution
- id
- campaignId
- referrerId
- referredId
- referralCodeId
- capturedAt
- qualifiedAt
- status

ReferralReward
- id
- attributionId
- beneficiaryId
- rewardType
- amount
- currency
- status
- ledgerReference
- idempotencyKey
```

## 56. États campagne

```text
DRAFT
REVIEW
SCHEDULED
ACTIVE
PAUSED
BUDGET_EXHAUSTED
ENDED
CANCELLED
ARCHIVED
```

Une campagne `ENDED` ne crée plus de nouvelles attributions mais peut terminer des qualifications déjà engagées si la politique le permet.

## 57. États récompense

```text
PENDING
RESERVED
PENDING_RISK_REVIEW
PAYABLE
PAID
REJECTED
EXPIRED
REVERSED
```

## 58. Observabilité

Mesures techniques :

- taux d’erreur résolution code ;
- latence qualification ;
- événements en retard ;
- doublons bloqués ;
- montant réservé ;
- montant payé ;
- anomalies fraude ;
- budget restant ;
- échecs ledger ;
- notifications échouées.

Des alertes doivent être déclenchées sur dérive anormale.

## 59. Tests obligatoires

Tests unitaires :

- résolution code ;
- expiration ;
- plafonds ;
- qualification ;
- calcul récompense ;
- idempotence ;
- budget ;
- états campagne.

Tests d’intégration :

- inscription → KYC → transaction → récompense ;
- événement livré deux fois ;
- budget simultanément presque épuisé ;
- annulation transaction ;
- fraude détectée avant paiement ;
- récompense ledger ;
- campagne en pause.

Tests sécurité :

- brute force codes ;
- accès cross-user ;
- accès cross-tenant ;
- auto-parrainage ;
- multi-comptes ;
- modification campagne sans rôle ;
- replay d’événement.

## 60. Concurrence

Si plusieurs qualifications arrivent simultanément alors que le budget est presque épuisé, la réservation budgétaire doit être transactionnelle ou utiliser un mécanisme équivalent garantissant qu’on ne dépasse pas la limite.

## 61. Multi-tenant

Une organisation ne voit que ses campagnes, participants et analytics autorisés.

Une campagne créée par une entreprise ne peut pas modifier les règles du programme grand public Mansa ou celles d’une administration.

Les administrateurs plateforme disposent d’un niveau global distinct et audité.

## 62. Configuration

Les fonctions sont activables via les mécanismes de configuration/feature flags existants.

Exemples :

```text
referral.consumer.enabled
referral.merchant.enabled
referral.agent.enabled
referral.qr.enabled
referral.reward.cash.enabled
referral.risk.delay.enabled
```

Une désactivation doit préserver les historiques.

## 63. Déploiement progressif

Ordre recommandé :

```text
1. invitations sans récompense
2. parrainage client simple
3. récompenses différées
4. anti-fraude avancé
5. commerçants
6. agents
7. campagnes partenaires
8. optimisation analytics
```

Le lancement peut être limité à un petit segment avant généralisation.

## 64. Conformité et fiscalité

Selon le pays, certaines récompenses peuvent avoir un traitement réglementaire, fiscal ou contractuel particulier.

Le moteur doit conserver les données nécessaires à l’audit et permettre de désactiver un type de récompense dans une juridiction.

Ce cahier des charges ne fixe pas le traitement juridique réel : il doit être validé avant production dans chaque pays.

## 65. Protection des mineurs et publics sensibles

Si un produit peut être utilisé par un mineur ou une population protégée, les mécanismes de parrainage financier doivent pouvoir être désactivés ou adaptés.

Les invitations institutionnelles ne doivent pas être transformées automatiquement en campagnes commerciales.

## 66. Réversibilité

Arrêter une campagne ne doit pas :

- supprimer les attributions historiques ;
- effacer les récompenses payées ;
- casser le ledger ;
- modifier les règles appliquées aux décisions passées.

Les corrections utilisent des écritures compensatoires ou des changements de statut audités.

## 67. Critères d’acceptation

Le module est acceptable lorsque :

- une campagne peut être créée, versionnée, publiée, suspendue et clôturée ;
- un code/lien peut être généré et résolu sans exposer d’identifiant sensible ;
- une attribution est unique selon la politique choisie ;
- une qualification dépend d’événements serveur ;
- une récompense monétaire est idempotente et passe par le ledger ;
- les plafonds et budgets sont respectés même sous concurrence ;
- les signaux de fraude peuvent retarder ou bloquer un bonus ;
- l’utilisateur comprend les conditions principales ;
- les administrateurs peuvent expliquer toute décision ;
- l’isolation multi-tenant est testée ;
- les analytics distinguent acquisition, qualification, coût et rétention.

## 68. Intégrations Mansa

Le module s’intègre au minimum avec :

```text
Identity
KYC/KYB
Risk Engine
Fraud
Wallet
Ledger
Pricing
Loyalty
Notifications
Analytics
Configuration / Feature Flags
Support / Disputes
Merchant
Agent Network
Business / Organizations
```

## 69. Principe final

Le parrainage Mansa doit être conçu comme un moteur de croissance gouverné, pas comme un simple champ « code promo ».

Toute récompense doit pouvoir répondre aux questions suivantes :

```text
Qui a invité qui ?
Par quelle campagne ?
Selon quelle règle/version ?
Quelle condition a été remplie ?
Quelle preuve a été utilisée ?
Quel budget a financé la récompense ?
Quelle écriture ledger a été créée ?
Quel risque a été évalué ?
Qui a modifié ou validé la campagne ?
```

Si une de ces réponses n’est pas traçable, le système n’est pas suffisamment robuste pour une fintech.
