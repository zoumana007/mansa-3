# Cahier des charges — Retraits espèces, cash-out et réseau agents

## 1. Objet

Ce document définit les exigences Mansa relatives au retrait d’espèces depuis un compte ou wallet via un agent, un commerçant autorisé, un point de service ou un dispositif partenaire. Il complète le domaine ATM déjà documenté sans le remplacer : le retrait ATM reste un canal autonome, tandis que le présent domaine couvre principalement le cash-out assisté.

L’objectif est de permettre un retrait sûr, rapide, traçable et rentable au Mali puis dans d’autres pays, avec gestion des commissions, de la liquidité agent, des plafonds, de la fraude, des litiges, du hors-ligne contrôlé et du rapprochement financier.

## 2. Principes directeurs

1. aucun retrait ne doit être payé en espèces sans autorisation serveur ou politique hors-ligne explicitement autorisée ;
2. le débit client et le paiement physique doivent être corrélés par un identifiant unique ;
3. le système doit empêcher le double retrait lors d’un retry, d’un redémarrage ou d’une reprise réseau ;
4. l’agent ne doit jamais pouvoir modifier librement le montant après autorisation ;
5. les commissions agent et frais client doivent être calculés côté serveur ;
6. les plafonds doivent dépendre du profil client, du niveau KYC, du pays, du canal, du risque et du statut agent ;
7. la liquidité de caisse de l’agent doit être suivie séparément de son solde numérique ;
8. tout écart, annulation, correction ou remboursement doit être auditable ;
9. le PIN, les secrets, données carte ou codes sensibles ne doivent jamais être journalisés ;
10. les opérations doivent alimenter le moteur fraude, les limites transactionnelles et les contrôles AML/KYC existants.

## 3. Périmètre fonctionnel

```text
AGENT_CASH_OUT
MERCHANT_CASH_OUT
WALLET_WITHDRAWAL
ACCOUNT_WITHDRAWAL
CARDLESS_WITHDRAWAL
QR_WITHDRAWAL
OTP_WITHDRAWAL
REFERENCE_WITHDRAWAL
THIRD_PARTY_WITHDRAWAL
CASH_OUT_FEE
AGENT_COMMISSION
AGENT_LIQUIDITY
CASH_OUT_LIMIT
CASH_OUT_RISK
CASH_OUT_REVERSAL
CASH_OUT_DISPUTE
CASH_OUT_RECONCILIATION
CASH_OUT_OFFLINE_RECOVERY
```

## 4. Parcours standard

```text
client initie le retrait
-> montant et canal sélectionnés
-> contrôles KYC / limites / fraude
-> création d’une intention de retrait
-> génération d’une référence, QR ou challenge
-> agent identifie la transaction
-> vérification agent + point de service
-> confirmation client selon politique
-> autorisation financière
-> débit ou réservation ledger
-> remise physique des espèces
-> confirmation de remise
-> commission agent
-> reçu et notification
-> rapprochement
```

## 5. Initiation côté client

Le client peut initier depuis :

- application Mansa ;
- USSD ou canal léger si activé ;
- QR dynamique ;
- code de retrait à usage unique ;
- agent autorisé avec consentement client ;
- API partenaire sous contrôle.

Le client doit voir avant validation : montant, frais, total débité, canal, point de retrait si connu et durée de validité.

## 6. Identification de l’agent

Chaque retrait doit être rattaché à :

```text
agentId
organizationId
servicePointId
deviceId
countryCode
currency
sessionId
```

Un agent suspendu, expiré, non KYC/KYB, hors zone autorisée ou sans capacité cash-out ne doit pas pouvoir servir le retrait.

## 7. Liquidité agent

Mansa doit distinguer :

- solde numérique de l’agent ;
- espèces physiques déclarées/estimées ;
- plafond de cash-out ;
- exposition nette ;
- commissions dues ;
- écarts en rapprochement.

Le moteur peut empêcher un retrait si la liquidité disponible est insuffisante ou si le point de service a dépassé son exposition maximale.

## 8. Réservation et débit

Deux modèles doivent être supportés :

### 8.1 Réservation puis capture

```text
AUTHORIZED
-> FUNDS_RESERVED
-> CASH_HANDOVER_CONFIRMED
-> CAPTURED
```

### 8.2 Débit immédiat compensable

```text
DEBITED
-> CASH_HANDOVER_PENDING
-> COMPLETED
```

En cas d’échec de remise physique, une écriture compensatrice doit être utilisée. Une écriture ledger ne doit jamais être supprimée.

## 9. États recommandés

```text
CREATED
RISK_CHECK_PENDING
AUTHORIZED
FUNDS_RESERVED
READY_FOR_AGENT
AGENT_ACCEPTED
CUSTOMER_CONFIRMATION_PENDING
CASH_HANDOVER_PENDING
CASH_HANDOVER_CONFIRMED
CAPTURED
COMPLETED
EXPIRED
CANCELLED
REJECTED
REVERSAL_PENDING
REVERSED
DISPUTED
FAILED
UNKNOWN
```

Les transitions doivent être contrôlées par machine d’état.

## 10. Références de retrait

Une référence doit être :

- aléatoire ;
- non prédictible ;
- courte uniquement si elle reste suffisamment robuste ;
- à usage unique ;
- limitée dans le temps ;
- liée au montant et au bénéficiaire ;
- invalidée après succès, annulation ou expiration.

Une référence ne doit jamais permettre à l’agent de changer le bénéficiaire ou le montant.

## 11. QR de retrait

Le QR peut contenir un identifiant opaque ou un jeton signé.

Il ne doit pas contenir en clair :

- PIN ;
- secret permanent ;
- données KYC sensibles ;
- informations bancaires inutiles.

Le backend reste la source d’autorité pour la transaction.

## 12. Confirmation client

Selon le risque et le canal, la confirmation peut utiliser :

- biométrie locale de l’application ;
- PIN Mansa ;
- OTP ;
- challenge in-app ;
- signature cryptographique de session ;
- confirmation serveur liée à l’appareil.

La présence physique chez l’agent ne doit pas suffire seule pour les montants sensibles.

## 13. Retrait sans Internet côté client

Le client peut recevoir ou préparer une référence avant perte de connexion.

Le point agent connecté peut ensuite résoudre la référence côté serveur.

Un mode totalement hors-ligne ne doit être autorisé que sous politique spécifique avec :

- plafond très limité ;
- jeton signé et non rejouable ;
- durée courte ;
- appareil agent de confiance ;
- compteur local anti-replay ;
- synchronisation obligatoire ;
- exposition financière bornée.

## 14. Hors-ligne côté agent

Par défaut, un agent hors-ligne ne doit pas effectuer de débit définitif arbitraire.

Un mode dégradé peut enregistrer une intention signée et différer la finalisation, mais ne doit jamais permettre plusieurs paiements physiques pour le même retrait.

## 15. Double dépense et anti-replay

Chaque retrait doit posséder :

```text
withdrawalId
idempotencyKey
customerId
agentId
amount
currency
expiresAt
nonce
status
```

Les endpoints de capture, confirmation de remise, reversal, commission et notification doivent être idempotents séparément.

## 16. Frais client

Les frais peuvent dépendre de :

- montant ;
- pays ;
- canal ;
- type d’agent ;
- abonnement ;
- partenaire ;
- campagne ;
- niveau KYC.

Le client doit connaître les frais avant confirmation.

## 17. Commission agent

La commission doit être configurable et calculée côté serveur.

Modèles possibles :

```text
FIXED
PERCENTAGE
TIERED
HYBRID
PERIODIC_BONUS
VOLUME_BONUS
```

La commission peut être créditée immédiatement ou après rapprochement selon la politique.

## 18. Partage de revenus

Un retrait peut répartir les revenus entre :

```text
MANSA
AGENT
MASTER_AGENT
BANK_PARTNER
DISTRIBUTOR
TAX_AUTHORITY_IF_APPLICABLE
OTHER_PARTNER
```

Les montants doivent être calculables, auditables et rapprochables.

## 19. Plafonds

Le moteur de limites doit gérer :

- minimum par retrait ;
- maximum par retrait ;
- plafond journalier ;
- plafond hebdomadaire ;
- plafond mensuel ;
- nombre d’opérations ;
- plafond agent ;
- plafond point de service ;
- plafond par appareil ;
- exposition hors-ligne.

## 20. Risque et fraude

Signaux recommandés :

- répétition rapide de retraits ;
- plusieurs clients vers un même agent anormalement ;
- retraits juste après changement de téléphone ou récupération de compte ;
- géolocalisation incohérente ;
- montant proche des plafonds ;
- taux d’annulation inhabituel ;
- nombreux échecs OTP/PIN ;
- agent avec écarts de caisse récurrents ;
- appareil rooté/compromis si détectable ;
- références testées en série ;
- retrait sur compte récemment crédité par flux risqué.

Actions possibles : autoriser, challenger, retarder, réduire le plafond, bloquer ou envoyer en revue.

## 21. Remise physique des espèces

L’agent doit confirmer la remise seulement après avoir effectivement préparé et remis le cash.

Pour certains montants, le système peut exiger une double confirmation :

```text
AGENT_READY
-> CUSTOMER_CONFIRMS_RECEIPT
-> CASH_HANDOVER_CONFIRMED
```

La confirmation ne constitue pas une preuve absolue ; elle fait partie du dossier d’audit.

## 22. Annulation

Une transaction peut être annulée avant la remise physique si :

- elle n’est pas capturée ;
- la référence n’a pas été consommée ;
- aucune remise confirmée n’existe ;
- la politique l’autorise.

Après remise confirmée, l’opération ne doit pas être simplement annulée : elle passe par reversal, ajustement ou litige.

## 23. Expiration

Une intention non utilisée expire automatiquement.

À expiration :

- la référence devient inutilisable ;
- toute réservation est libérée ;
- aucune commission n’est due ;
- l’événement est journalisé.

## 24. Reversal

Cas possibles :

- débit effectué mais agent n’a pas remis le cash ;
- timeout réseau avec état incertain ;
- capture dupliquée empêchée ou détectée ;
- erreur partenaire ;
- décision de litige.

Le reversal doit utiliser une écriture compensatrice et rester corrélé à la transaction originale.

## 25. État inconnu

En cas de coupure au moment critique, utiliser `UNKNOWN` plutôt que supposer succès ou échec.

Un worker de récupération doit :

1. interroger le ledger ;
2. interroger les événements agent/appareil ;
3. vérifier la capture ;
4. vérifier la commission ;
5. résoudre ou envoyer en revue.

## 26. Litiges

Le dossier doit pouvoir contenir :

- référence ;
- chronologie ;
- agent ;
- appareil ;
- montant ;
- frais ;
- challenge utilisé ;
- événements réseau ;
- preuves de confirmation ;
- journaux techniques non sensibles ;
- décision finale.

Motifs : cash non reçu, montant incomplet, agent conteste, débit double, mauvaise commission, erreur technique.

## 27. Rapprochement agent

Pour une période :

```text
cashOutPhysicalExpected
vs
ledgerDebits
vs
agentFloatMovements
vs
commissions
vs
settlementPartner
```

Les écarts doivent être classés :

```text
MATCHED
SHORTAGE
OVERAGE
PENDING_REVIEW
DISPUTED
RESOLVED
```

## 28. Clôture de caisse

Une session agent peut enregistrer :

- fonds initial ;
- cash-in ;
- cash-out ;
- commissions ;
- remboursements ;
- ajustements ;
- cash théorique ;
- cash compté ;
- écart.

Toute modification rétroactive doit être auditée.

## 29. Séparation des tâches

Pour les corrections sensibles :

```text
AGENT != CASH_DISCREPANCY_APPROVER
SUPPORT != LEDGER_ADJUSTER_WITHOUT_APPROVAL
TECHNICIAN != FINANCIAL_APPROVER
```

Les seuils de double validation doivent être configurables.

## 30. API recommandée

```text
POST /cash-outs
GET /cash-outs/{id}
POST /cash-outs/{id}/authorize
POST /cash-outs/{id}/agent-accept
POST /cash-outs/{id}/customer-confirm
POST /cash-outs/{id}/handover
POST /cash-outs/{id}/capture
POST /cash-outs/{id}/cancel
POST /cash-outs/{id}/reverse
GET /agents/{id}/liquidity
POST /agents/{id}/cash-session/open
POST /agents/{id}/cash-session/close
```

Les noms définitifs doivent suivre les conventions API Mansa.

## 31. Entités recommandées

```text
CashOutOrder
CashOutAttempt
CashOutAuthorization
CashOutReference
CashOutChallenge
CashOutHandover
CashOutCapture
CashOutReversal
CashOutFee
AgentCommission
AgentLiquidityPosition
AgentCashSession
CashOutLimitPolicy
CashOutRiskDecision
CashOutDispute
CashOutReconciliation
CashOutIncident
AuditLog
```

## 32. Événements

```text
cash_out.created
cash_out.authorized
cash_out.agent_accepted
cash_out.customer_confirmed
cash_out.handover_confirmed
cash_out.captured
cash_out.completed
cash_out.expired
cash_out.cancelled
cash_out.reversal_requested
cash_out.reversed
cash_out.disputed
agent.liquidity_low
agent.cash_session_closed
```

## 33. Notifications

Notifier le client pour :

- création ;
- autorisation ;
- succès ;
- expiration ;
- reversal ;
- litige important.

Ne jamais inclure le PIN ou une référence réutilisable dans une notification non sécurisée.

## 34. Observabilité

Mesures recommandées :

```text
cash_out_success_rate
cash_out_failure_rate
cash_out_unknown_state_count
cash_out_reversal_rate
cash_out_dispute_rate
cash_out_average_amount
agent_liquidity_low_count
agent_shortage_rate
cash_out_latency
```

## 35. Sécurité appareil agent

L’application agent doit pouvoir vérifier :

- session active ;
- appareil enregistré ;
- version minimale ;
- intégrité lorsque techniquement possible ;
- révocation à distance ;
- renouvellement des tokens ;
- verrouillage après inactivité.

Les secrets longue durée ne doivent pas être stockés en clair.

## 36. Multi-tenant et multi-pays

Chaque transaction doit être rattachée à l’organisation, au pays, à la devise, au réseau agent et au partenaire pertinent.

Un agent d’une organisation ne doit pas voir ou servir une transaction d’une autre organisation sans autorisation explicite.

## 37. UX agent

L’interface doit afficher clairement :

- montant à remettre ;
- identité minimale nécessaire ;
- statut de confirmation ;
- commission prévue ;
- alerte de liquidité ;
- expiration ;
- succès ou échec.

Les boutons critiques doivent empêcher les doubles clics et afficher un état de traitement.

## 38. UX client

Le client doit voir :

- montant demandé ;
- frais ;
- total débité ;
- agent ou point de service ;
- statut ;
- reçu ;
- moyen de contester.

## 39. Tests obligatoires

Tester au minimum :

- retrait nominal ;
- référence expirée ;
- référence déjà utilisée ;
- agent suspendu ;
- liquidité insuffisante ;
- plafond dépassé ;
- double appel capture ;
- coupure après débit avant remise ;
- coupure après remise avant confirmation ;
- reversal ;
- commission agent ;
- accès cross-tenant refusé ;
- retry réseau ;
- challenge invalide ;
- récupération état `UNKNOWN`.

## 40. Critères d’acceptation

Le module est acceptable lorsque :

1. aucun retrait ne peut être payé deux fois ;
2. le débit client est toujours corrélé à une remise cash ;
3. les frais et commissions sont déterministes et auditables ;
4. les agents non autorisés sont bloqués ;
5. la liquidité agent est contrôlée ;
6. les reversals utilisent le ledger et non la suppression d’écriture ;
7. le hors-ligne ne crée pas d’exposition non bornée ;
8. les litiges disposent d’une chronologie complète ;
9. l’isolation multi-tenant est testée ;
10. le rapprochement agent peut expliquer chaque mouvement financier et physique.

## 41. Relation avec les autres domaines Mansa

Ce module s’intègre avec :

- identité et authentification ;
- KYC/KYB ;
- réseau agents ;
- wallets et ledger ;
- limites transactionnelles ;
- fraude et risk engine ;
- tarification et commissions ;
- notifications ;
- litiges et support ;
- observabilité ;
- gestion des appareils ;
- ATM ;
- cash-in et dépôts d’espèces.

Il ne remplace aucun de ces domaines et doit réutiliser leurs politiques communes plutôt que dupliquer leur logique.
