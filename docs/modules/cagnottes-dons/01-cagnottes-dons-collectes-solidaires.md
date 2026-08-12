# Cagnottes, dons et collectes solidaires Mansa

## 1. Objet et positionnement

Ce document définit le module **Cagnottes & Dons** de Mansa. Il couvre la création, la publication, la contribution, la collecte, la conservation temporaire des fonds, le versement au bénéficiaire, le remboursement, la modération, la conformité, la fraude, l’administration, les frais et commissions, ainsi que les intégrations partenaires nécessaires.

Le module doit fonctionner comme une brique autonome de la plateforme Mansa, réutilisable dans l’application Client, les portails associations/entreprises, le portail Admin, le Hub et les API partenaires.

Le module ne doit jamais être implémenté comme un simple transfert P2P avec un titre. Une cagnotte possède son propre cycle de vie, ses règles, son bénéficiaire, son objectif, ses participants, ses droits, son statut de conformité, sa traçabilité et ses règles de décaissement.

## 2. Principes directeurs

1. **Séparation comptable** : les montants collectés sont suivis individuellement par cagnotte et ne doivent pas être confondus avec le solde libre du créateur.
2. **Traçabilité complète** : chaque contribution, frais, remboursement, décaissement, modification sensible et action d’administration laisse une trace auditable.
3. **Conformité par pays** : création, collecte publique, dons, collecte associative, collecte commerciale et collecte au profit de tiers peuvent être activés, restreints ou interdits par pays et type d’acteur.
4. **Partenaires abstraits** : banques, Mobile Money, cartes, acquéreurs, prestataires KYC/KYB et autres fournisseurs sont intégrés derrière des adaptateurs ; aucun partenaire précis n’est supposé disponible sans contrat réel.
5. **Protection du donateur** : le donateur doit voir clairement le bénéficiaire, l’organisateur, l’objectif, l’utilisation annoncée des fonds, les frais et les conditions de remboursement éventuel avant confirmation.
6. **Pricing centralisé** : aucun frais métier ne doit être codé en dur. Les frais et commissions sont calculés par le moteur central de pricing de Mansa.
7. **Idempotence financière** : une même contribution, un même remboursement ou un même décaissement ne doit jamais être comptabilisé deux fois.
8. **Minimisation des données** : seules les données nécessaires à la collecte, la conformité, la prévention de la fraude, la preuve et les obligations légales sont conservées.

## 3. Cas d’usage couverts

Le module doit permettre, selon les règles locales et les feature flags :

- cagnotte familiale ;
- mariage et événements privés ;
- décès et soutien aux proches ;
- santé et frais médicaux ;
- études et scolarité ;
- cadeau commun ;
- voyage ou projet personnel ;
- association et ONG ;
- projet communautaire ;
- urgence humanitaire ;
- projet professionnel ;
- soutien à une petite entreprise ;
- collecte interne d’entreprise ;
- collecte scolaire ou universitaire ;
- contribution à un événement ;
- collecte publique avec page partageable ;
- collecte privée sur invitation ;
- cagnotte avec un ou plusieurs bénéficiaires ;
- contribution ponctuelle ;
- contribution récurrente lorsque juridiquement et techniquement disponible.

Les collectes assimilables juridiquement à de l’investissement, du prêt rémunéré, de l’émission de titres ou du crowdfunding réglementé ne doivent pas être mélangées à ce module. Elles doivent être routées vers le futur module Investissements/Financement approprié.

## 4. Acteurs

### 4.1 Organisateur

Utilisateur ou organisation qui crée et administre la cagnotte. Il peut être différent du bénéficiaire.

### 4.2 Bénéficiaire

Personne physique, association, entreprise, établissement ou organisation à qui les fonds sont destinés. Le bénéficiaire peut devoir accepter sa désignation avant publication ou décaissement selon le pays et le niveau de risque.

### 4.3 Contributeur / donateur

Personne qui effectue une contribution. Elle peut choisir, si autorisé, d’afficher son nom publiquement ou de contribuer de manière anonyme vis-à-vis du public. L’anonymat public ne signifie jamais anonymat vis-à-vis de Mansa lorsqu’une identification est légalement nécessaire.

### 4.4 Co-organisateur

Personne invitée à gérer certains aspects d’une cagnotte sans forcément disposer du droit de retirer les fonds.

### 4.5 Modérateur / conformité / fraude / support

Agents internes Mansa soumis au RBAC/ABAC, à la séparation des rôles et à l’audit.

## 5. Types de cagnotte

Enumération recommandée `CampaignType` :

- `PRIVATE_POOL`
- `PUBLIC_DONATION`
- `ASSOCIATION_FUNDRAISER`
- `COMMUNITY_PROJECT`
- `MEDICAL_SUPPORT`
- `EDUCATION_SUPPORT`
- `EVENT_POOL`
- `BUSINESS_SUPPORT`
- `EMERGENCY_RELIEF`
- `INTERNAL_ORGANIZATION_POOL`
- `OTHER_ALLOWED`

Le type influe sur les justificatifs, les plafonds, les règles KYC/KYB, la visibilité, les moyens de paiement autorisés, les règles de retrait et les contrôles de fraude.

## 6. Visibilité

`Visibility` :

- `PRIVATE_INVITE_ONLY` : uniquement les personnes ayant un lien/invitation valide ;
- `UNLISTED` : accessible par lien mais non indexée dans Mansa ;
- `PUBLIC` : visible dans les espaces publics autorisés ;
- `ORGANIZATION_ONLY` : visible uniquement pour les membres d’une organisation ;
- `APPROVAL_REQUIRED` : contribution ou accès soumis à validation.

Une cagnotte publique ne doit jamais devenir publique par défaut sans action explicite de l’organisateur et, si nécessaire, validation Mansa.

## 7. Cycle de vie

`CampaignStatus` :

- `DRAFT`
- `PENDING_VERIFICATION`
- `PENDING_MODERATION`
- `APPROVED`
- `ACTIVE`
- `PAUSED`
- `SUSPENDED_RISK`
- `GOAL_REACHED`
- `ENDED`
- `PAYOUT_PENDING`
- `PAYOUT_PARTIAL`
- `PAYOUT_COMPLETED`
- `REFUNDING`
- `REFUNDED`
- `CANCELLED`
- `REJECTED`
- `ARCHIVED`

Transitions critiques :

- aucune publication si les contrôles obligatoires ne sont pas satisfaits ;
- une cagnotte suspendue n’accepte plus de contribution ;
- la suspension doit pouvoir bloquer les retraits indépendamment des contributions ;
- un changement de bénéficiaire après activation déclenche une nouvelle validation ;
- l’objectif atteint n’implique pas automatiquement un décaissement ;
- la clôture n’efface aucune donnée financière ni preuve obligatoire.

## 8. Création d’une cagnotte

Champs minimums :

- `title` ;
- `description` ;
- `campaignType` ;
- `organizerId` / `organizationId` ;
- `beneficiaryType` et `beneficiaryId` ou bénéficiaire externe à vérifier ;
- `countryCode` ;
- `currency` ;
- `targetAmount` facultatif selon type ;
- `minimumContribution` facultatif ;
- `maximumContribution` calculé ou administré ;
- `startAt` ;
- `endAt` facultatif ;
- `visibility` ;
- `allowAnonymousPublicDisplay` ;
- `allowMessages` ;
- `allowRecurringContribution` ;
- `allowPartialPayout` si autorisé ;
- `coverImageAssetId` ;
- `documents[]` ;
- `termsVersionAccepted` ;
- `pricingPolicyId` résolu au moment de l’opération, jamais choisi arbitrairement par le client.

Le formulaire doit être progressif : informations essentielles, bénéficiaire, objectif, justificatifs, visibilité, aperçu, vérification, publication.

## 9. Page de cagnotte

La page publique ou privée doit afficher :

- titre ;
- organisateur ;
- bénéficiaire clairement identifié ;
- badge de vérification lorsque pertinent ;
- description ;
- objectif ;
- montant collecté disponible ;
- pourcentage de progression ;
- nombre de contributions ;
- échéance ;
- catégories ;
- photos/documents rendus publics volontairement ;
- utilisation annoncée des fonds ;
- dernières mises à jour ;
- frais appliqués avant validation du paiement ;
- bouton contribuer ;
- bouton partager ;
- bouton signaler ;
- règles de remboursement ou de non-remboursement ;
- mentions réglementaires adaptées au pays.

Le compteur public ne doit pas forcément exposer le solde comptable exact si des contributions sont en attente, annulées, remboursées ou contestées. Il doit utiliser une métrique calculée et définie : `confirmedGrossCollected`, `netAvailable`, `paidOut`, etc.

## 10. Contribution

### 10.1 Moyens possibles

Selon pays, partenaire, disponibilité et feature flags :

- wallet Mansa ;
- Mobile Money ;
- carte bancaire ;
- virement bancaire ;
- lien de paiement ;
- QR Mansa ;
- autres rails partenaires autorisés.

### 10.2 Parcours

1. choix du montant ;
2. choix du moyen de paiement ;
3. choix de visibilité du nom/message si autorisé ;
4. calcul temps réel des frais ;
5. affichage du montant débité, du montant allant à la cagnotte, des frais et taxes ;
6. consentement ;
7. authentification/confirmation adaptée au rail ;
8. création de la contribution avec clé d’idempotence ;
9. paiement ;
10. confirmation ;
11. émission d’un reçu ;
12. mise à jour de l’agrégat de cagnotte ;
13. notification des acteurs selon préférences.

### 10.3 États de contribution

`ContributionStatus` :

- `INITIATED`
- `PENDING_PAYMENT`
- `AUTHORIZED`
- `CONFIRMED`
- `FAILED`
- `EXPIRED`
- `CANCELLED`
- `REFUND_PENDING`
- `PARTIALLY_REFUNDED`
- `REFUNDED`
- `CHARGEBACK`
- `REVERSED`
- `UNDER_REVIEW`

Une contribution n’augmente le montant confirmé qu’après l’événement financier correspondant.

## 11. Contributions récurrentes

Fonction désactivée par défaut et activable par pays/type de cagnotte. Elle repose sur un mandat ou mécanisme partenaire légalement valable.

Le contributeur doit pouvoir :

- voir le montant et la fréquence ;
- connaître la prochaine échéance ;
- suspendre ou annuler selon les règles ;
- recevoir un rappel lorsqu’exigé ;
- consulter les exécutions réussies et échouées.

La fin de la cagnotte doit automatiquement empêcher les futurs prélèvements.

## 12. Bénéficiaires multiples

Une cagnotte peut, si le pays l’autorise, avoir plusieurs bénéficiaires avec une politique de répartition :

- pourcentage fixe ;
- montant fixe ;
- distribution manuelle soumise à approbation ;
- ordre de priorité ;
- distribution selon jalons documentés.

Toute modification de la répartition après première contribution doit être versionnée, justifiée et, selon le niveau de risque, soumise à nouvelle acceptation des bénéficiaires et/ou contrôle Mansa.

## 13. Gestion des fonds et ledger

Le module doit s’intégrer au ledger financier central Mansa.

Objets comptables logiques recommandés :

- wallet source du contributeur ou compte de règlement partenaire ;
- compte technique de collecte ;
- sous-ledger par cagnotte ;
- compte de frais Mansa ;
- compte de commission partenaire ;
- compte taxes ;
- compte suspense/risque ;
- compte de remboursement ;
- compte de décaissement bénéficiaire.

Une cagnotte ne doit pas être représentée par un simple champ `balance` modifiable. Le solde est dérivé d’écritures comptables immuables et d’agrégats recalculables.

Métriques recommandées :

- `grossCollected` ;
- `confirmedGrossCollected` ;
- `pendingCollected` ;
- `refundedAmount` ;
- `chargebackAmount` ;
- `feesAmount` ;
- `taxAmount` ;
- `netAvailableAmount` ;
- `reservedAmount` ;
- `paidOutAmount`.

## 14. Décaissement

`PayoutPolicy` doit être configurable :

- uniquement à la fin ;
- lorsque l’objectif est atteint ;
- retrait partiel autorisé ;
- retrait par jalons ;
- décaissement manuel Mansa ;
- décaissement automatique après contrôles ;
- décaissement vers wallet Mansa ;
- compte bancaire ;
- Mobile Money ;
- autre rail partenaire autorisé.

Avant décaissement :

- vérifier l’état de la cagnotte ;
- vérifier KYC/KYB du bénéficiaire ;
- recalculer le montant réellement disponible ;
- appliquer réserves liées aux litiges/chargebacks ;
- vérifier sanctions/AML lorsque nécessaire ;
- réévaluer fraude ;
- calculer les frais de décaissement selon le pricing versionné ;
- appliquer limites et règles pays ;
- demander une approbation supplémentaire au-delà de seuils configurables.

`PayoutStatus` : `REQUESTED`, `PENDING_REVIEW`, `APPROVED`, `PROCESSING`, `PAID`, `PARTIAL`, `FAILED`, `REVERSED`, `BLOCKED`, `CANCELLED`.

## 15. Remboursements et annulations

Le remboursement n’est pas forcément automatique dans tous les cas. La politique dépend du type de cagnotte, du rail de paiement, du statut des fonds et du droit applicable.

Cas à prévoir :

- annulation avant toute contribution ;
- annulation avec fonds non décaissés ;
- objectif non atteint ;
- fraude avérée ;
- bénéficiaire invalide ;
- demande volontaire de l’organisateur ;
- contribution effectuée par erreur ;
- chargeback externe ;
- remboursement partiel ;
- remboursement impossible vers rail d’origine, nécessitant une procédure contrôlée.

Chaque remboursement conserve le lien vers la contribution d’origine et ne doit jamais dépasser le montant remboursable net autorisé.

## 16. Vérification et conformité

### 16.1 KYC/KYB progressif

Le niveau de vérification dépend :

- du pays ;
- du type d’organisateur ;
- du type de bénéficiaire ;
- du caractère public/privé ;
- des montants ;
- du cumul des collectes ;
- du risque ;
- du type de cause.

Exemples de contrôles : identité, preuve de vie, coordonnées, bénéficiaire effectif, documents d’association, immatriculation entreprise, mandat de représentation, RIB/compte de destination, justificatifs de cause médicale ou éducative lorsque nécessaire.

### 16.2 AML/CFT et sanctions

Le module doit exposer les événements nécessaires au moteur de surveillance transactionnelle :

- création de cagnotte ;
- changement de bénéficiaire ;
- forte accélération des contributions ;
- nombreux contributeurs liés ;
- contributions fractionnées ;
- géographies incohérentes ;
- retrait rapide ;
- changement fréquent de destination ;
- chargebacks inhabituels ;
- circulation entre comptes liés.

Aucune règle AML ne doit être codée uniquement dans ce module ; celui-ci consomme les services centraux conformité/fraude.

## 17. Modération et signalements

La modération doit couvrir :

- faux récit ;
- usurpation ;
- images trompeuses ;
- collecte interdite ;
- contenu haineux ou illégal ;
- fraude caritative ;
- fausse urgence ;
- bénéficiaire non consentant ;
- utilisation commerciale non déclarée.

`ReportReason` doit être configurable par pays.

Workflow de modération : `OPEN`, `TRIAGED`, `NEEDS_EVIDENCE`, `RESTRICTED`, `CLEARED`, `REMOVED`, `ESCALATED`, `CLOSED`.

Une suspension de contenu et une suspension financière sont deux contrôles distincts.

## 18. Fraude et scoring

Signaux possibles :

- création de multiples cagnottes similaires ;
- appareils partagés entre organisateurs apparemment distincts ;
- anomalies d’identité ;
- pics de contribution depuis des moyens liés ;
- cartes ou wallets à forte fraude ;
- rotations rapides collecte/décaissement ;
- modification du bénéficiaire juste avant retrait ;
- répétition de contenus/images ;
- incohérence pays, IP, devise, téléphone, identité ;
- taux de remboursement ou chargeback élevé.

Actions : demander justificatif, retarder le décaissement, imposer réserve, limiter les moyens de paiement, mettre en revue, suspendre, clôturer et rembourser si la procédure l’exige.

## 19. Pricing, frais et commissions

Le module consomme obligatoirement le **Pricing & Commission Engine central**. Aucun taux n’est codé dans le code métier.

Dimensions de tarification :

- pays ;
- devise ;
- type de cagnotte ;
- public/privé ;
- type d’organisateur ;
- type de bénéficiaire ;
- moyen de contribution ;
- moyen de décaissement ;
- canal ;
- volume ;
- montant ;
- partenaire ;
- segment client ;
- promotion ;
- date d’effet.

Composants possibles :

- frais fixe ;
- pourcentage ;
- fixe + pourcentage ;
- minimum ;
- maximum ;
- paliers ;
- gratuité ;
- nombre d’opérations gratuites ;
- commission Mansa ;
- commission agent ;
- commission commerçant ;
- commission partenaire ;
- commission apporteur ;
- taxes séparées ;
- prise en charge des frais par le contributeur, l’organisateur, le bénéficiaire ou Mansa selon politique autorisée.

Le devis de frais retourne un `pricingQuoteId` signé/logique avec expiration courte. La contribution finalisée conserve : `pricingPolicyVersionId`, détail des composantes, montant brut, montant net et taxes. Une modification future du tarif ne change jamais l’historique.

Avant publication d’une nouvelle politique tarifaire : simulation, estimation d’impact, approbation si nécessaire, programmation de date d’effet, publication et audit immuable.

## 20. Modèle de données recommandé

### Campaign

- `id`
- `publicSlug`
- `type`
- `status`
- `visibility`
- `organizerUserId`
- `organizerOrganizationId`
- `countryCode`
- `currency`
- `title`
- `description`
- `targetAmount`
- `startAt`
- `endAt`
- `publishedAt`
- `closedAt`
- `allowAnonymousPublicDisplay`
- `allowRecurringContribution`
- `allowPartialPayout`
- `riskLevel`
- `complianceStatus`
- `termsVersion`
- timestamps

### CampaignBeneficiary

- `id`
- `campaignId`
- `beneficiaryType`
- `userId` / `organizationId` / `externalBeneficiaryId`
- `allocationType`
- `allocationValue`
- `verificationStatus`
- `acceptanceStatus`
- `payoutDestinationId`
- timestamps

### Contribution

- `id`
- `campaignId`
- `contributorUserId` nullable selon règles
- `paymentIntentId`
- `grossAmount`
- `currency`
- `feeAmount`
- `taxAmount`
- `netCampaignAmount`
- `status`
- `publicDisplayMode`
- `message`
- `pricingQuoteId`
- `pricingPolicyVersionId`
- `idempotencyKey`
- timestamps

### CampaignPayout

- `id`
- `campaignId`
- `beneficiaryId`
- `requestedAmount`
- `feeAmount`
- `taxAmount`
- `netAmount`
- `destinationId`
- `status`
- `reviewCaseId`
- `pricingPolicyVersionId`
- timestamps

### CampaignUpdate

Actualités publiées par l’organisateur avec version, auteur, médias et état de modération.

### CampaignInvite

Lien ou invitation avec token opaque haché, expiration, nombre maximal d’utilisations et permissions éventuelles.

### CampaignReport

Signalement avec motif, auteur, preuve, statut, agent assigné et décision.

### CampaignAuditEvent

Référence normalisée vers l’audit central ; les actions financières sensibles ne doivent pas dépendre d’un simple historique applicatif éditable.

## 21. API fonctionnelle

Préfixe indicatif `/v1/campaigns` :

- `POST /campaigns`
- `GET /campaigns/{id}`
- `PATCH /campaigns/{id}`
- `POST /campaigns/{id}/submit`
- `POST /campaigns/{id}/publish`
- `POST /campaigns/{id}/pause`
- `POST /campaigns/{id}/cancel`
- `POST /campaigns/{id}/beneficiaries`
- `PATCH /campaigns/{id}/beneficiaries/{beneficiaryId}`
- `POST /campaigns/{id}/invites`
- `POST /campaigns/{id}/pricing-quote`
- `POST /campaigns/{id}/contributions`
- `GET /campaigns/{id}/contributions`
- `POST /contributions/{id}/refund`
- `POST /campaigns/{id}/payouts`
- `GET /campaigns/{id}/payouts`
- `POST /campaigns/{id}/updates`
- `POST /campaigns/{id}/reports`
- `GET /me/campaigns`
- `GET /me/contributions`

Toutes les mutations financières exigent idempotence. Les réponses ne doivent pas exposer de données personnelles non nécessaires.

## 22. Webhooks et événements

Événements internes/externes recommandés :

- `campaign.created`
- `campaign.submitted`
- `campaign.approved`
- `campaign.activated`
- `campaign.paused`
- `campaign.suspended`
- `campaign.goal_reached`
- `campaign.ended`
- `campaign.cancelled`
- `campaign.beneficiary_changed`
- `contribution.initiated`
- `contribution.confirmed`
- `contribution.failed`
- `contribution.refunded`
- `contribution.chargeback`
- `payout.requested`
- `payout.approved`
- `payout.paid`
- `payout.failed`
- `campaign.reported`
- `campaign.review_required`

Les webhooks partenaires doivent être signés, rejouables de manière sûre, idempotents, journalisés et versionnés.

## 23. RBAC et ABAC

Permissions indicatives :

- `campaign.create`
- `campaign.read.own`
- `campaign.read.public`
- `campaign.update.own`
- `campaign.publish`
- `campaign.invite.manage`
- `campaign.contribute`
- `campaign.payout.request`
- `campaign.payout.approve`
- `campaign.moderate`
- `campaign.risk.review`
- `campaign.compliance.review`
- `campaign.refund.execute`
- `campaign.pricing.manage`
- `campaign.admin.override`

ABAC : pays, type de campagne, relation organisateur/bénéficiaire, montant, statut KYC/KYB, niveau de risque, organisation, rôle et contexte d’appareil.

Aucun agent support standard ne doit pouvoir modifier un bénéficiaire puis approuver son propre décaissement.

## 24. Administration

Le portail Admin doit permettre :

- recherche multicritère ;
- vue 360° cagnotte ;
- organisateur et bénéficiaires ;
- timeline complète ;
- contributions ;
- remboursements ;
- décaissements ;
- frais et commissions ;
- documents ;
- signaux fraude ;
- contrôles AML ;
- signalements ;
- suspensions ;
- réserves ;
- feature flags ;
- limites par pays ;
- politiques de modération ;
- catégories interdites ;
- SLA de revue ;
- export autorisé et journalisé.

Toute action sensible exige motif obligatoire et audit.

## 25. Feature flags

Exemples :

- `campaigns.enabled`
- `campaigns.public.enabled`
- `campaigns.private.enabled`
- `campaigns.associations.enabled`
- `campaigns.business.enabled`
- `campaigns.recurring_contributions.enabled`
- `campaigns.partial_payout.enabled`
- `campaigns.external_beneficiary.enabled`
- `campaigns.card_contribution.enabled`
- `campaigns.mobile_money_contribution.enabled`
- `campaigns.bank_transfer.enabled`
- `campaigns.public_discovery.enabled`

Portée possible : global, pays, partenaire, segment, organisation, version d’application.

## 26. Multi-pays et multi-devises

Une cagnotte possède une devise de référence. Les contributions dans d’autres devises ne sont autorisées que si le moteur FX et les partenaires le permettent. Le contributeur voit le taux, les frais FX, le montant débité et le montant crédité avant confirmation.

Les plafonds, catégories autorisées, justificatifs, mentions légales, durées maximales et politiques de remboursement sont paramétrables par pays.

## 27. Réseau faible et hors ligne

La création de brouillon peut tolérer une sauvegarde locale chiffrée limitée et une reprise de saisie. En revanche :

- aucune contribution financière ne doit être considérée confirmée hors ligne ;
- aucun décaissement ne doit être validé localement sans autorisation serveur ;
- les tentatives doivent utiliser idempotence lors de la reconnexion ;
- l’application affiche explicitement `en attente de confirmation` si le statut final n’est pas connu ;
- les reçus définitifs sont émis uniquement après confirmation serveur.

## 28. Sécurité

Exigences :

- chiffrement en transit et au repos selon le socle Mansa ;
- secrets uniquement dans le gestionnaire de secrets ;
- URL médias signées lorsque privées ;
- contrôle antivirus/antimalware des documents ;
- limitation de débit sur création, contribution, invitation, signalement ;
- protection anti-bot ;
- défense contre énumération des cagnottes privées ;
- tokens d’invitation opaques et révocables ;
- confirmation renforcée pour changement de bénéficiaire ou destination ;
- step-up authentication pour décaissement sensible ;
- journalisation des changements d’appareil et sessions à risque ;
- aucune donnée carte brute conservée par le module.

## 29. Confidentialité et rétention

Le module distingue :

- données publiques volontairement publiées ;
- données privées organisateur ;
- données privées bénéficiaire ;
- données financières ;
- documents conformité ;
- preuves fraude/litige ;
- messages de contributeurs.

L’utilisateur doit pouvoir supprimer ou masquer les contenus non soumis à obligation de conservation. Les transactions, preuves comptables, dossiers fraude et obligations réglementaires suivent les politiques centrales de rétention Mansa. Les médias inutiles doivent être purgés selon politique.

## 30. Notifications

Cas : publication, contribution reçue, objectif proche/atteint, échéance, vérification requise, pièce refusée, décaissement demandé, décaissement effectué, remboursement, suspension, nouveau signalement interne, mise à jour publiée.

Canaux : in-app, push, email, SMS ou autres selon préférences, disponibilité et criticité. Les notifications ne remplacent jamais l’état source dans le backend.

## 31. Observabilité et SLO

Métriques :

- taux de création réussie ;
- taux de publication ;
- conversion visite/contribution ;
- succès paiement par rail ;
- latence du pricing ;
- latence confirmation ;
- taux de remboursement ;
- taux de chargeback ;
- volume suspendu pour risque ;
- temps moyen de modération ;
- temps moyen de décaissement ;
- erreurs partenaires ;
- divergence agrégat/ledger.

Alertes prioritaires : double comptabilisation potentielle, désynchronisation ledger, payout sans réserve suffisante, webhook partenaire massivement en échec, hausse anormale chargeback/fraude.

## 32. Résilience

- outbox transactionnelle pour événements financiers ;
- retries avec backoff ;
- dead-letter queue ;
- circuit breakers partenaires ;
- idempotency store ;
- reconciliation périodique ;
- recalcul des agrégats depuis le ledger ;
- aucune perte silencieuse de webhook ;
- procédures de reprise après indisponibilité d’un rail.

## 33. Tests obligatoires

### Fonctionnels

- création brouillon ;
- validation ;
- publication ;
- campagne privée ;
- contribution wallet ;
- contribution partenaire simulée ;
- échec ;
- retry idempotent ;
- remboursement ;
- payout partiel ;
- payout total ;
- bénéficiaires multiples ;
- objectif atteint ;
- expiration ;
- suspension risque ;
- changement bénéficiaire ;
- invitation révoquée.

### Pricing

- fixe ;
- pourcentage ;
- fixe + pourcentage ;
- min/max ;
- paliers ;
- gratuité ;
- promotion ;
- taxes ;
- changement de version ;
- conservation historique du prix appliqué.

### Sécurité

- escalade de privilèges ;
- accès à cagnotte privée ;
- token d’invitation volé/révoqué ;
- double payout ;
- double contribution ;
- modification de montant côté client ;
- contournement des limites ;
- upload malveillant ;
- abus API ;
- CSRF/XSS selon surfaces ;
- secrets absents des logs.

### Résilience

- timeout Mobile Money ;
- webhook dupliqué ;
- webhook hors ordre ;
- partenaire indisponible ;
- panne après écriture ledger avant réponse HTTP ;
- reprise worker ;
- réconciliation nocturne ;
- restauration après incident.

## 34. Performance et montée en charge

Le système doit supporter de fortes pointes sur une cagnotte virale sans verrou global. Utiliser agrégats asynchrones lorsque possible, pagination cursor, caches contrôlés pour pages publiques, protections anti-hot-key et lectures ledger optimisées.

Les opérations financières restent fortement cohérentes même si les statistiques publiques sont éventuellement cohérentes à court délai.

## 35. Ordre de développement recommandé

1. modèles Campaign/Beneficiary et RBAC ;
2. brouillons, publication et visibilité ;
3. ledger/sous-ledger cagnotte ;
4. contribution wallet Mansa ;
5. intégration Pricing Engine ;
6. reçus et historique ;
7. décaissement vers wallet Mansa ;
8. KYC/KYB progressif ;
9. modération/signalement ;
10. fraude/AML ;
11. remboursements ;
12. moyens externes via adaptateurs ;
13. bénéficiaires multiples ;
14. contributions récurrentes ;
15. admin avancé ;
16. analytics, SLO, reconciliation et tests de charge.

## 36. Critères d’acceptation

Le module est considéré prêt pour une première mise en production uniquement si :

- aucune cagnotte active ne peut exister sans organisateur et bénéficiaire valides selon la politique du pays ;
- chaque contribution confirmée correspond à des écritures ledger équilibrées ;
- toute mutation financière est idempotente ;
- les frais sont calculés exclusivement via une politique tarifaire versionnée ;
- le détail des frais est affiché avant confirmation ;
- un changement futur de tarif ne modifie aucune transaction historique ;
- les retraits ne peuvent dépasser le net disponible ;
- les réserves fraude/chargeback sont respectées ;
- les rôles sont séparés pour les opérations sensibles ;
- les cagnottes privées ne sont pas énumérables publiquement ;
- les feature flags par pays fonctionnent ;
- KYC/KYB, fraude et conformité peuvent bloquer contribution ou décaissement ;
- les remboursements restent reliés à leur contribution d’origine ;
- les webhooks sont signés, idempotents et rejouables ;
- la réconciliation détecte toute divergence ledger/agrégat ;
- les journaux d’audit contiennent les motifs des actions sensibles ;
- les tests critiques, sécurité, résilience et performance passent ;
- aucun secret ni identifiant partenaire réel n’est présent dans le dépôt.

## 37. Décisions à conserver pour la suite Mansa

- Le nom produit recommandé dans l’application Client est **Cagnottes & Dons**.
- Le module est distinct de l’épargne personnelle, de la tontine et de l’investissement.
- Les cagnottes publiques, privées, associatives et professionnelles partagent le même moteur avec politiques différentes.
- Les fonds collectés sont traçables par cagnotte dans le ledger central.
- Le Pricing & Commission Engine est obligatoire et pilotable depuis l’administration sans changement de code.
- Les rails externes restent abstraits et activables uniquement après contractualisation réelle.
- Le fonctionnement multi-pays repose sur configuration, feature flags, conformité et pricing versionnés.