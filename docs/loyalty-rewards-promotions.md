# Fidélité, récompenses, promotions et cashback

## 1. Objet

Ce document définit le cahier des charges du domaine fidélité Mansa.

Le domaine permet aux commerçants, réseaux, entreprises, administrations et partenaires autorisés de créer des programmes de fidélité, points, avantages, coupons, promotions, cashback, offres ciblées et récompenses, sans mélanger ces mécanismes avec le solde monétaire principal du client.

Le moteur doit être multi-tenant, configurable par pays et organisation, auditable, compatible avec les paiements Mansa et les paiements externes éligibles, et utilisable depuis l’application client, l’application commerçant, les TPE, le portail administrateur et les API partenaires.

La fidélité ne doit jamais permettre de contourner les règles financières, KYC, AML/CFT, limites de paiement, droits d’accès ou règles de remboursement.

## 2. Principes de référence

Principes obligatoires :

- séparation stricte entre argent réel, points, coupons, crédits promotionnels et cashback en attente ;
- chaque programme appartient à une organisation ou à un réseau clairement identifié ;
- aucune récompense ne doit être créée ou débitée sans événement métier traçable ;
- les règles sont versionnées et datées ;
- les conditions appliquées à une transaction restent reproductibles après modification future de la campagne ;
- tous les calculs monétaires utilisent des montants entiers dans l’unité mineure ou une convention monétaire stable ;
- toute opération répétable doit être idempotente ;
- les droits d’administration sont séparés des droits de caisse ;
- les programmes peuvent être activés, suspendus ou arrêtés sans supprimer l’historique ;
- aucune offre ne doit exposer un autre tenant ;
- les règles de consentement, confidentialité et rétention Mansa s’appliquent aux données de ciblage.

## 3. Périmètre fonctionnel

Le domaine couvre au minimum :

```text
Points de fidélité
Cashback
Coupons
Codes promotionnels
Réductions automatiques
Avantages par niveau
Offres partenaires
Récompenses de bienvenue
Récompenses par fréquence
Récompenses par volume
Récompenses événementielles
Parrainage
Bonus temporaires
Multiplicateurs de points
Catalogues de récompenses
Expiration
Annulation et reprise
Remboursements
Reporting
Fraude et abus
```

## 4. Types de programme

Types recommandés :

```text
POINTS
CASHBACK
DISCOUNT
COUPON
TIERED
STAMP_CARD
REFERRAL
PARTNER_BENEFITS
HYBRID
```

Un programme `HYBRID` peut combiner plusieurs mécanismes, mais chaque composant doit rester identifiable et auditable.

## 5. Portée d’un programme

Un programme peut être limité à :

```text
ORGANIZATION
MERCHANT
MERCHANT_GROUP
STORE
COUNTRY
REGION
PRODUCT_CATEGORY
PRODUCT
CHANNEL
CAMPAIGN
```

Exemples :

- programme national d’un réseau de supermarchés ;
- promotion limitée à une boutique ;
- cashback valable uniquement sur certains produits ;
- avantage valable uniquement via paiement QR Mansa ;
- campagne réservée à une région ;
- offre d’un partenaire pour les détenteurs d’une carte spécifique.

## 6. Entités principales

Entités recommandées :

```text
LoyaltyProgram
LoyaltyProgramVersion
LoyaltyAccount
LoyaltyMembership
LoyaltyRule
LoyaltyTier
LoyaltyBalance
LoyaltyLedgerEntry
Reward
RewardCatalog
RewardRedemption
Promotion
PromotionRule
Coupon
CouponBatch
CouponRedemption
CashbackEvent
ReferralProgram
Referral
CampaignAudience
CampaignEnrollment
LoyaltyTransactionLink
LoyaltyAdjustment
LoyaltyFraudSignal
LoyaltyAuditLog
```

## 7. Programme de fidélité

`LoyaltyProgram` contient au minimum :

- id ;
- organizationId ;
- countryCode ;
- name ;
- description ;
- type ;
- currency éventuelle ;
- status ;
- startAt ;
- endAt éventuel ;
- enrollmentMode ;
- earningPolicyId ;
- redemptionPolicyId ;
- expirationPolicyId ;
- branding ;
- termsVersion ;
- createdBy ;
- createdAt ;
- updatedAt.

Statuts possibles :

```text
DRAFT
SCHEDULED
ACTIVE
PAUSED
ENDED
ARCHIVED
```

## 8. Versionnement des règles

Chaque changement important crée une `LoyaltyProgramVersion`.

Une version enregistre :

- date d’effet ;
- auteur ;
- règles de gain ;
- règles d’utilisation ;
- plafonds ;
- exclusions ;
- règles d’expiration ;
- conditions de cumul ;
- configuration de campagne ;
- motif du changement.

Une transaction historique référence la version exacte utilisée lors du calcul.

## 9. Adhésion

Modes d’adhésion possibles :

```text
AUTOMATIC
OPT_IN
INVITATION_ONLY
CONTRACTUAL
EMPLOYEE_ONLY
PARTNER_ONLY
```

Le mode `OPT_IN` nécessite un consentement explicite lorsque la réglementation ou la politique de données l’exige.

Une désinscription ne doit pas effacer l’historique comptable nécessaire à l’audit.

## 10. Compte de fidélité

Un `LoyaltyAccount` est distinct d’un wallet monétaire.

Il peut contenir :

- points disponibles ;
- points en attente ;
- points expirés ;
- points bloqués ;
- cashback disponible ;
- cashback en attente ;
- niveau actuel ;
- progression vers le niveau suivant ;
- coupons actifs ;
- date de dernière activité.

Le solde est reconstruit à partir d’un ledger et ne doit pas dépendre uniquement d’un champ mutable.

## 11. Ledger de fidélité

`LoyaltyLedgerEntry` doit être immuable.

Types possibles :

```text
EARN
PENDING_EARN
RELEASE_PENDING
REDEEM
REFUND_RESTORE
REVERSAL
EXPIRATION
MANUAL_ADJUSTMENT
PROMO_BONUS
REFERRAL_BONUS
TIER_BONUS
```

Chaque entrée contient :

- accountId ;
- programId ;
- amount ;
- unitType ;
- sourceType ;
- sourceId ;
- transactionId éventuel ;
- ruleVersionId ;
- idempotencyKey ;
- createdAt ;
- expiresAt éventuel ;
- metadata contrôlée.

## 12. Unités de récompense

Unités supportées :

```text
POINT
STAMP
CASHBACK_XOF
CASHBACK_CURRENCY
CREDIT_PROMO
BENEFIT_TOKEN
```

Un `CREDIT_PROMO` n’est pas un dépôt client et ne doit pas être confondu avec de la monnaie électronique.

## 13. Gain de points

Les règles de gain peuvent dépendre de :

- montant dépensé ;
- nombre d’achats ;
- catégorie produit ;
- commerçant ;
- canal de paiement ;
- heure ;
- jour ;
- campagne ;
- statut client ;
- niveau de fidélité ;
- pays ;
- moyen de paiement ;
- code promotionnel ;
- première transaction ;
- fréquence d’achat.

Exemple :

```text
1 point pour 100 FCFA dépensés
x2 points le week-end
+500 points au premier achat
```

## 14. Calcul des points

Le moteur doit définir explicitement :

- base de calcul ;
- règle d’arrondi ;
- plafond par transaction ;
- plafond journalier ;
- plafond mensuel ;
- montant minimal ;
- montant maximal éligible ;
- exclusions ;
- multiplicateurs ;
- priorité des règles.

Aucune valeur flottante imprécise ne doit être utilisée pour les calculs financiers.

## 15. Points en attente

Certains gains peuvent être `PENDING` pendant une période de sécurité.

Exemples :

- commande e-commerce non livrée ;
- paiement susceptible de remboursement ;
- transaction en attente de règlement ;
- campagne à risque de fraude.

Après confirmation :

```text
PENDING_EARN → RELEASE_PENDING
```

En cas d’annulation :

```text
PENDING_EARN → REVERSAL
```

## 16. Expiration des points

Modes possibles :

```text
NO_EXPIRATION
FIXED_DATE
N_DAYS_AFTER_EARN
N_MONTHS_AFTER_EARN
INACTIVITY_BASED
CAMPAIGN_END
```

L’expiration doit être déterministe et auditable.

Le client doit pouvoir consulter la prochaine quantité de points arrivant à expiration.

## 17. Utilisation des points

Modes de redemption :

```text
FULL_PAYMENT
PARTIAL_PAYMENT
FIXED_REWARD
CATALOG_REWARD
DISCOUNT_PERCENT
DISCOUNT_FIXED
PARTNER_BENEFIT
```

Le système doit vérifier avant consommation :

```text
programme actif
→ compte actif
→ solde suffisant
→ récompense disponible
→ période valide
→ canal autorisé
→ commerçant autorisé
→ limites respectées
→ absence de blocage fraude
```

## 18. Réservation temporaire

Pour les paiements nécessitant confirmation, les points peuvent être réservés temporairement.

États :

```text
AVAILABLE
RESERVED
CONSUMED
RELEASED
```

Un timeout doit libérer automatiquement une réservation abandonnée.

## 19. Cashback

Le cashback doit être représenté séparément des points.

États recommandés :

```text
PENDING
AVAILABLE
REDEEMED
REVERSED
EXPIRED
```

Le passage de `PENDING` à `AVAILABLE` peut dépendre :

- du règlement final ;
- de la fin du délai de retour ;
- de la livraison ;
- de contrôles de fraude ;
- d’une validation partenaire.

## 20. Utilisation du cashback

Selon le programme, le cashback peut être :

- déduit d’un achat futur ;
- converti en avantage ;
- converti en points ;
- transféré vers un wallet si contractuellement et réglementairement permis ;
- réservé à une enseigne.

La conversion en valeur monétaire réelle doit respecter le cadre juridique, contractuel et comptable applicable.

## 21. Coupons

Un coupon contient :

- code ou identifiant ;
- campagne ;
- type ;
- valeur ;
- devise éventuelle ;
- période de validité ;
- nombre maximal d’utilisations ;
- nombre maximal par utilisateur ;
- conditions ;
- périmètre ;
- statut ;
- règles de cumul.

Types :

```text
FIXED_DISCOUNT
PERCENT_DISCOUNT
FREE_ITEM
BUY_X_GET_Y
FREE_DELIVERY
BONUS_POINTS
BONUS_CASHBACK
```

## 22. Codes promotionnels

Les codes peuvent être :

```text
PUBLIC
UNIQUE_PER_USER
BATCH_GENERATED
PARTNER_SPECIFIC
EMPLOYEE
INFLUENCER
REFERRAL
```

Les codes à usage unique doivent être générés avec une entropie suffisante pour empêcher l’énumération simple.

## 23. Lots de coupons

`CouponBatch` permet de générer des volumes importants.

Champs :

- quantité ;
- préfixe éventuel ;
- campagne ;
- générateur sécurisé ;
- date de création ;
- export autorisé ou non ;
- statut ;
- compteur utilisés/non utilisés.

Les exports doivent être protégés et audités.

## 24. Promotions automatiques

Une promotion peut s’appliquer sans code.

Exemples :

```text
-10 % sur une catégorie
500 FCFA de remise au-delà de 10 000 FCFA
x2 points après 18h
livraison offerte à partir de 20 000 FCFA
```

La promotion doit être évaluée côté serveur ou dans un moteur local sécurisé synchronisé lorsque le fonctionnement hors ligne l’exige.

## 25. Priorité et cumul des promotions

Chaque promotion possède :

- priorité ;
- groupe d’exclusivité ;
- règle de cumul ;
- budget ;
- plafond ;
- période.

Modes de cumul :

```text
STACKABLE
EXCLUSIVE
BEST_OFFER_ONLY
PRIORITY_ONLY
LIMITED_STACK
```

Le résultat final doit être explicable.

## 26. Moteur de meilleure offre

Lorsque plusieurs promotions sont compatibles, le système peut calculer la meilleure combinaison selon la politique du commerçant.

Le moteur doit éviter une explosion combinatoire non contrôlée.

Pour une transaction donnée, il doit conserver :

- promotions évaluées ;
- promotions rejetées ;
- motifs ;
- combinaison sélectionnée ;
- économie obtenue.

## 27. Cartes de fidélité virtuelles

Mansa peut présenter une carte virtuelle de fidélité.

Elle peut contenir :

- logo du programme ;
- nom ;
- numéro public non sensible ;
- QR dynamique ou statique selon politique ;
- niveau ;
- points ;
- avantages actifs.

Le QR ne doit pas permettre à lui seul une opération sensible non autorisée.

## 28. Carte Mansa et fidélité

Une carte physique Mansa peut déclencher l’identification d’un programme compatible.

Les données de fidélité ne doivent pas nécessiter le stockage de secrets de programme dans la puce lorsque le backend peut rester source d’autorité.

## 29. TPE et caisse

Le TPE ou l’application commerce peut :

- identifier le client avec consentement ;
- afficher les avantages disponibles ;
- appliquer une promotion ;
- utiliser des points ;
- afficher les points gagnés ;
- imprimer les informations de fidélité sur le reçu ;
- fonctionner en mode dégradé selon règles locales.

Le caissier ne doit pas pouvoir effectuer un ajustement manuel non autorisé.

## 30. Fonctionnement hors ligne

Le mode hors ligne peut permettre :

- lecture de règles signées mises en cache ;
- calcul de promotion déterministe ;
- enregistrement d’un gain provisoire ;
- file locale d’événements ;
- synchronisation ultérieure.

Les opérations à risque peuvent être refusées hors ligne.

La resynchronisation doit utiliser idempotence et détection de doublons.

## 31. Commerce et catalogue

Le moteur doit pouvoir recevoir :

- sku ;
- catégorie ;
- marque ;
- prix ;
- quantité ;
- promotion produit ;
- taxes ;
- magasin.

Une règle promotionnelle ne doit pas dépendre de texte libre non normalisé si une taxonomie produit existe.

## 32. Programmes multi-commerçants

Un programme peut fédérer plusieurs commerçants.

Il faut alors définir :

- règles de financement ;
- responsabilité des points ;
- taux de conversion ;
- règlement entre partenaires ;
- plafonds ;
- responsabilité des remboursements ;
- reporting séparé ;
- gouvernance des campagnes.

## 33. Financement d’une récompense

Sources possibles :

```text
MERCHANT_FUNDED
MANSA_FUNDED
PARTNER_FUNDED
CO_FUNDED
PUBLIC_PROGRAM_FUNDED
```

La source doit être enregistrée pour le rapprochement comptable.

## 34. Budget de campagne

Une campagne peut avoir :

- budget total ;
- budget quotidien ;
- budget par utilisateur ;
- plafond de récompenses ;
- seuil d’alerte ;
- date de fin automatique.

Lorsque le budget est épuisé, le comportement doit être déterminé à l’avance :

```text
STOP
PAUSE
CONTINUE_WITHOUT_REWARD
FALLBACK_RULE
```

## 35. Niveaux de fidélité

`LoyaltyTier` peut représenter :

```text
STANDARD
SILVER
GOLD
PLATINUM
```

ou des noms personnalisés.

Critères possibles :

- dépenses cumulées ;
- nombre de transactions ;
- points gagnés ;
- ancienneté ;
- statut contractuel.

## 36. Progression de niveau

La progression doit indiquer :

- métrique actuelle ;
- objectif ;
- période ;
- date de recalcul ;
- date d’expiration du statut éventuel.

La rétrogradation doit suivre une règle explicite.

## 37. Avantages par niveau

Exemples :

- multiplicateur de points ;
- cashback supérieur ;
- frais réduits lorsque contractuellement permis ;
- offres exclusives ;
- support prioritaire ;
- accès anticipé ;
- récompenses anniversaire.

Les avantages financiers ne doivent pas contourner le moteur tarifaire central.

## 38. Parrainage

Un programme de parrainage enregistre :

- parrain ;
- filleul ;
- code ;
- date ;
- condition de qualification ;
- statut ;
- récompense parrain ;
- récompense filleul ;
- signal de fraude.

États :

```text
INVITED
REGISTERED
QUALIFIED
REWARDED
REJECTED
CANCELLED
```

## 39. Anti-abus du parrainage

Détections possibles :

- même appareil ;
- même identité ;
- même moyen de paiement ;
- numéros réutilisés ;
- comptes créés en masse ;
- cycles de parrainage ;
- comportement transactionnel artificiel.

Une récompense suspecte peut rester en attente.

## 40. Ciblage des campagnes

Critères possibles :

- pays ;
- ville ;
- segment ;
- type de client ;
- historique d’achat agrégé ;
- niveau de fidélité ;
- inactivité ;
- catégorie d’intérêt ;
- canal ;
- langue ;
- consentement marketing.

Les critères sensibles sont interdits sauf base légale et politique explicite.

## 41. Consentement marketing

Le consentement pour recevoir une promotion est distinct de l’adhésion technique au programme lorsque nécessaire.

Canaux :

```text
PUSH
SMS
EMAIL
IN_APP
WHATSAPP_PARTNER si autorisé
```

La révocation doit être respectée rapidement.

## 42. Personnalisation IA

Jini ou un moteur analytique peut recommander une offre, mais :

- la décision finale reste bornée par les règles du programme ;
- aucun modèle ne peut inventer une récompense financière ;
- les données utilisées suivent les règles de confidentialité ;
- les recommandations doivent être désactivables ;
- la segmentation sensible doit être contrôlée ;
- le moteur déterministe reste source d’autorité pour le calcul.

## 43. Interface client

L’application client doit pouvoir afficher :

- programmes actifs ;
- solde de points ;
- cashback ;
- niveau ;
- progression ;
- coupons ;
- récompenses disponibles ;
- historique ;
- points expirant bientôt ;
- conditions principales ;
- adhésion/désinscription ;
- préférences de communication.

## 44. Interface commerçant

Le commerçant autorisé peut :

- créer un programme ;
- créer une campagne ;
- définir des règles ;
- voir les performances ;
- suspendre une campagne ;
- gérer un catalogue de récompenses ;
- consulter les redemptions ;
- traiter les anomalies ;
- proposer un ajustement soumis à validation.

## 45. Interface administrateur Mansa

Le portail admin doit permettre selon RBAC :

- superviser les programmes ;
- examiner les campagnes à risque ;
- consulter les budgets ;
- auditer les ajustements ;
- suspendre un programme en cas d’incident ;
- consulter les signaux de fraude ;
- imposer des plafonds réglementaires ;
- gérer les intégrations partenaires.

## 46. Ajustements manuels

Un ajustement nécessite :

- utilisateur autorisé ;
- motif obligatoire ;
- référence ;
- valeur avant ;
- valeur ajoutée/retirée ;
- validation supplémentaire au-delà d’un seuil ;
- audit.

Il ne faut jamais éditer directement le solde final.

## 47. Remboursement d’un achat

Lors d’un remboursement :

- les points gagnés peuvent être repris ;
- le cashback peut être annulé ;
- les points dépensés peuvent être restaurés ;
- un coupon peut être restauré ou non selon la politique ;
- le traitement doit être proportionnel en cas de remboursement partiel.

Le moteur doit empêcher les gains nets artificiels liés à des achats remboursés.

## 48. Annulation et reversal

Les reversements doivent référencer l’entrée originale.

Une entrée historique n’est jamais supprimée.

Exemple :

```text
EARN +100
REVERSAL -100
```

## 49. Chargebacks

Si un paiement carte fait l’objet d’un chargeback :

- les récompenses associées peuvent être gelées ;
- les récompenses déjà utilisées deviennent une créance promotionnelle ou un risque selon la politique ;
- le compte peut être signalé au moteur de risque ;
- aucune suppression silencieuse n’est autorisée.

## 50. Fraude

Signaux possibles :

- volume de points anormal ;
- redemptions en rafale ;
- coupons partagés ;
- utilisation multi-comptes ;
- transactions artificielles ;
- remboursements après récompense ;
- collusion caissier-client ;
- ajustements manuels fréquents ;
- dépassement géographique improbable ;
- automatisation de codes promotionnels.

## 51. Actions de risque

Actions possibles :

```text
ALLOW
PENDING_REVIEW
BLOCK_REWARD
FREEZE_ACCOUNT
REQUIRE_VERIFICATION
CANCEL_PROMOTION
ESCALATE
```

Une action sur le compte de fidélité ne doit pas bloquer automatiquement un wallet monétaire sans décision séparée du moteur de risque financier.

## 52. Sécurité API

Les endpoints doivent appliquer :

- authentification ;
- scopes ;
- tenant isolation ;
- validation stricte ;
- rate limiting ;
- idempotence ;
- journalisation ;
- permissions fines ;
- contrôle des montants ;
- protection anti-replay pour événements signés.

## 53. Endpoints indicatifs

Exemples :

```text
GET    /loyalty/programs
POST   /loyalty/programs
GET    /loyalty/accounts/:id
GET    /loyalty/accounts/:id/ledger
POST   /loyalty/earn
POST   /loyalty/redeem
POST   /loyalty/reverse
GET    /promotions
POST   /promotions
POST   /coupons/validate
POST   /coupons/redeem
POST   /referrals
GET    /rewards/catalog
POST   /rewards/redeem
```

Les API publiques doivent être exposées via la plateforme développeur et ses scopes.

## 54. Webhooks

Événements possibles :

```text
loyalty.points.earned
loyalty.points.redeemed
loyalty.points.expired
loyalty.tier.changed
loyalty.cashback.available
loyalty.reward.redeemed
promotion.applied
coupon.redeemed
referral.qualified
campaign.budget.threshold
```

Les webhooks suivent les règles de signature, retry et anti-replay de la plateforme développeur.

## 55. Notifications

Notifications utiles :

- points gagnés ;
- cashback disponible ;
- points expirant bientôt ;
- passage de niveau ;
- coupon reçu ;
- récompense disponible ;
- campagne personnalisée ;
- parrainage qualifié.

Les notifications commerciales respectent les préférences de canal.

## 56. Reçus

Un reçu peut afficher :

- points gagnés ;
- points utilisés ;
- nouveau solde ;
- cashback gagné ;
- remise appliquée ;
- coupon ;
- programme ;
- identifiant de transaction.

Aucune donnée sensible inutile ne doit être imprimée.

## 57. Comptabilité

Le système doit distinguer :

- coût promotionnel ;
- provision éventuelle ;
- dette de récompense ;
- consommation ;
- expiration ;
- financement partenaire ;
- remboursement ;
- ajustement.

Le modèle comptable final dépend du contrat et du traitement réglementaire applicable.

## 58. Rapprochement

Rapprochement recommandé :

```text
transaction commerciale
→ règle appliquée
→ récompense calculée
→ écriture loyalty ledger
→ budget campagne
→ financement
→ consommation éventuelle
→ reporting
```

Toute divergence significative doit être détectable.

## 59. Analytics

Indicateurs :

- membres actifs ;
- taux d’adhésion ;
- taux de redemption ;
- points émis ;
- points expirés ;
- cashback émis ;
- coût campagne ;
- panier moyen ;
- fréquence d’achat ;
- rétention ;
- lift campagne ;
- fraude détectée ;
- ROI estimé.

Les mesures marketing ne doivent pas être présentées comme causalité certaine sans méthodologie appropriée.

## 60. A/B testing

Les campagnes peuvent utiliser des groupes expérimentaux.

Exigences :

- assignation stable ;
- groupe contrôle ;
- exclusion mutuelle si nécessaire ;
- métriques définies avant lancement ;
- taille minimale ;
- audit de la version ;
- respect du consentement.

## 61. Multi-pays

Chaque programme doit pouvoir définir :

- pays ;
- devise ;
- langue ;
- fiscalité ;
- règles réglementaires ;
- fuseau horaire ;
- calendrier ;
- format des montants ;
- restrictions locales.

Un programme régional ne doit jamais supposer que les mêmes règles légales s’appliquent à tous les pays.

## 62. Devises

Un programme peut être mono-devise ou multi-devise selon contrat.

Pour les points basés sur un montant, la devise source doit être enregistrée.

Une conversion éventuelle utilise une politique de change documentée et versionnée.

## 63. Accessibilité et langues

Toutes les interfaces doivent utiliser l’infrastructure i18n Mansa.

Exigences :

- textes traduisibles ;
- contrastes suffisants ;
- montants lisibles ;
- boutons accessibles ;
- prise en charge du français, du bamanankan et de l’anglais selon disponibilité produit ;
- formats locaux ;
- absence de texte essentiel uniquement dans une image.

## 64. Marque blanche

Un programme peut être présenté sous la marque du commerçant, partenaire, réseau ou institution.

Éléments configurables :

- logo ;
- couleurs ;
- nom ;
- visuels ;
- wording ;
- conditions ;
- mention facultative `Propulsé par Mansa` selon contrat.

La personnalisation ne doit pas modifier les règles de sécurité.

## 65. Performance

Les calculs promotionnels synchrones au checkout doivent respecter un budget de latence strict.

Le moteur doit :

- précompiler ou mettre en cache les règles fréquentes ;
- éviter les requêtes N+1 ;
- limiter le nombre de campagnes évaluées ;
- supporter la montée en charge ;
- produire un résultat déterministe.

## 66. Cohérence transactionnelle

Une transaction de paiement ne doit pas être considérée échouée uniquement parce qu’une récompense non critique n’a pas pu être publiée immédiatement.

Architecture recommandée :

```text
paiement confirmé
→ événement durable
→ traitement fidélité idempotent
→ ledger fidélité
→ notification
```

Pour une remise appliquée avant paiement, la remise doit être fixée avant l’autorisation financière.

## 67. Event sourcing partiel

Le domaine peut utiliser un journal d’événements, mais le ledger reste la source de vérité des mouvements de valeur fidélité.

Événements possibles :

```text
LOYALTY_ENROLLMENT_CREATED
POINTS_EARNED
POINTS_REDEEMED
POINTS_EXPIRED
CASHBACK_RELEASED
COUPON_REDEEMED
TIER_CHANGED
PROGRAM_PAUSED
```

## 68. Données personnelles

Le système doit minimiser les données utilisées pour les campagnes.

Préférer des segments ou attributs calculés aux copies inutiles de données personnelles dans chaque campagne.

Les exports de listes clients doivent être restreints, tracés et évités lorsque le ciblage peut être exécuté dans Mansa.

## 69. Rétention

La rétention distingue :

- ledger nécessaire à l’audit ;
- données de campagne ;
- consentements ;
- logs techniques ;
- audiences temporaires ;
- données analytiques agrégées.

Les données temporaires de ciblage doivent être supprimées lorsqu’elles ne sont plus nécessaires.

## 70. Suppression de compte utilisateur

Une demande de suppression doit respecter les obligations légales de conservation.

Les données marketing peuvent être supprimées ou anonymisées alors que certaines écritures financières/audit restent conservées sous forme minimale.

## 71. Import de programme externe

Un commerçant peut migrer un programme existant.

Le processus doit prévoir :

- mapping identités ;
- import balances ;
- source ;
- date de référence ;
- validation ;
- rapprochement ;
- fichier rejet ;
- audit ;
- idempotence.

Un import ne modifie jamais silencieusement des comptes déjà actifs.

## 72. Export

Exports possibles selon permission :

- membres ;
- soldes ;
- ledger ;
- coupons ;
- campagnes ;
- redemptions ;
- rapports financiers.

Les exports sensibles doivent être chiffrés et expirer.

## 73. Support et litiges

Le support doit pouvoir expliquer :

- pourquoi une récompense a été gagnée ;
- pourquoi elle n’a pas été accordée ;
- pourquoi elle a expiré ;
- quelle règle a été appliquée ;
- quel remboursement a déclenché une reprise.

Le support ne doit pas éditer directement un ledger.

## 74. Audit

Événements audités :

- création programme ;
- changement règle ;
- activation ;
- suspension ;
- ajustement ;
- export ;
- création coupon batch ;
- modification budget ;
- changement de niveau manuel ;
- action antifraude ;
- override.

## 75. Tests obligatoires

Tests minimaux :

- calcul simple ;
- arrondis ;
- plafonds ;
- promotions cumulables ;
- promotions exclusives ;
- expiration ;
- remboursement total ;
- remboursement partiel ;
- retry idempotent ;
- double redemption ;
- coupon expiré ;
- coupon déjà utilisé ;
- isolation tenant ;
- budget épuisé ;
- concurrence ;
- mode hors ligne ;
- reprise après synchronisation ;
- fraude par parrainage ;
- droits admin ;
- export non autorisé.

## 76. Tests de concurrence

Le système doit démontrer qu’un même coupon ou même solde ne peut pas être consommé deux fois lors de requêtes concurrentes.

Techniques possibles :

- transaction DB ;
- verrou optimiste ;
- contrainte unique ;
- ledger avec réservation atomique.

## 77. Observabilité

Métriques recommandées :

- latence du moteur de règles ;
- taux d’erreur ;
- redemptions ;
- conflits idempotence ;
- campagnes saturées ;
- budget restant ;
- files d’événements ;
- synchronisations hors ligne ;
- signaux de fraude.

Les logs ne doivent pas inclure de codes coupons confidentiels en clair lorsque cela n’est pas nécessaire.

## 78. Feature flags

Les nouveaux mécanismes de fidélité doivent pouvoir être déployés progressivement.

Le rollout peut être limité à :

- organisation ;
- pays ;
- magasin ;
- pourcentage de clients ;
- environnement.

Une désactivation d’urgence doit exister.

## 79. Compatibilité avec les domaines Mansa

Intégrations attendues :

```text
Payments
Wallet / Ledger
Cards
Merchant / POS
Checkout
Invoices
Subscriptions
Notifications
Analytics
Risk Engine
KYC / Identity
Developer Platform
Jini
Data Governance
```

Chaque intégration utilise des contrats explicites et ne crée pas de dépendance directe entre bases de données.

## 80. Séparation avec le wallet monétaire

Règle critique :

```text
LoyaltyBalance != WalletBalance
```

Un point, coupon ou crédit promotionnel n’est jamais présenté comme de l’argent disponible tant qu’une conversion réglementaire et contractuelle explicite n’a pas eu lieu.

## 81. Gouvernance

Rôles recommandés :

```text
LOYALTY_ADMIN
CAMPAIGN_MANAGER
MARKETING_ANALYST
MERCHANT_MANAGER
FINANCE_REVIEWER
FRAUD_REVIEWER
SUPPORT_READONLY
AUDITOR
```

La séparation des tâches doit pouvoir être imposée.

## 82. Approbation de campagne

Selon seuil, une campagne peut nécessiter une validation :

```text
DRAFT
PENDING_APPROVAL
APPROVED
SCHEDULED
ACTIVE
PAUSED
ENDED
```

Les campagnes à fort budget ou à forte remise peuvent nécessiter une approbation financière.

## 83. Rollback de règle

Une règle publiée n’est pas supprimée rétroactivement.

Un rollback crée une nouvelle version reprenant une configuration antérieure à partir d’une date d’effet définie.

Les transactions passées restent attachées à leur version originale.

## 84. Principe final

Le moteur de fidélité Mansa doit augmenter la valeur commerciale sans devenir un second système monétaire opaque. Chaque point, cashback, coupon et remise doit avoir une origine, une règle, un propriétaire, un budget éventuel et une trace d’audit. La simplicité de l’expérience utilisateur ne doit jamais supprimer l’isolation multi-tenant, l’idempotence, la maîtrise des coûts, la prévention de fraude et la traçabilité.