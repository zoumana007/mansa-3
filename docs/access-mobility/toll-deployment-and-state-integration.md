# Access & Mobility — Déploiement des péages et intégration État

## 1. Objet

Ce document définit le cadre fonctionnel, matériel, opérationnel et commercial des solutions de péage Mansa destinées à l'État, aux concessionnaires et aux exploitants privés.

Mansa doit permettre un déploiement progressif, multi-fournisseurs et auditable, sans imposer le remplacement immédiat de tous les équipements existants.

## 2. Trois architectures de péage à distinguer

Deux solutions initiales doivent coexister dès le lancement :

### A. Péage automatique classique avec barrière

Le véhicule s'arrête à une borne ou un poste numérisé, le montant est déterminé selon la catégorie et la grille tarifaire applicable, puis l'usager paie avec un canal autorisé. Après validation, le contrôleur autorise l'ouverture de la barrière.

### B. Télépéage RFID avec barrière

Le véhicule abonné est identifié automatiquement par un tag UHF RFID passif associé à un véhicule et à un compte. Le lecteur/antenne transmet l'identifiant au contrôleur local puis à Mansa. Si les règles sont satisfaites, le paiement ou la consommation d'abonnement est enregistré et la barrière s'ouvre via relais OPEN ou interface industrielle équivalente.

### C. Évolution optionnelle future vers le free-flow

Une architecture sans barrière pourra être ajoutée ultérieurement à certains sites, reposant notamment sur ANPR, RFID, classification automatique et traitement a posteriori des exceptions.

Le free-flow est une évolution optionnelle. Il ne remplace pas les deux solutions initiales et ne doit pas rendre leur exploitation impossible.

## 3. Moyens de paiement du péage classique

Le péage classique doit pouvoir supporter, selon les capacités du poste et les canaux activés par l'administration :

- billets FCFA/XOF ;
- pièces FCFA/XOF ;
- carte bancaire EMV ;
- sans-contact/NFC ;
- carte Mansa ;
- wallet Mansa ;
- QR Mansa ;
- autres QR autorisés ;
- Mobile Money ;
- autres moyens futurs intégrés par adaptateur.

Le terminal carte accepte uniquement les réseaux activés par l'acquéreur. Visa et Mastercard doivent être supportables lorsqu'ils sont contractuellement disponibles. Mansa ne doit jamais promettre l'acceptation de toutes les cartes du monde.

## 4. Politique Mobile Money

Mobile Money est un canal configurable, jamais un comportement codé en dur.

L'administration doit pouvoir l'activer ou le désactiver avec date d'effet au niveau :

- national ;
- réseau de péages ;
- poste de péage ;
- voie ;
- type de voie ;
- période planifiée si nécessaire.

Chaque changement doit enregistrer :

- ancienne valeur ;
- nouvelle valeur ;
- périmètre ;
- auteur ;
- date de décision ;
- date d'effet ;
- motif ;
- journal d'audit.

Une indisponibilité temporaire d'un opérateur ne doit pas supprimer automatiquement Mobile Money de la configuration nationale. Le moteur peut rendre le canal temporairement indisponible sur une voie tout en conservant la politique d'activation.

## 5. Télépéage RFID initial

Le télépéage initial repose sur des tags UHF RFID passifs.

Chaque tag peut être associé à :

- véhicule ;
- plaque ;
- propriétaire ou organisation ;
- compte ou wallet ;
- abonnement ;
- catégorie de véhicule ;
- sites autorisés ;
- statut ;
- règles tarifaires ;
- limites éventuelles.

Chaîne recommandée :

`Véhicule → antenne/lecteur UHF RFID → contrôleur local → moteur Mansa → autorisation → relais OPEN → barrière → capteurs de passage → confirmation → audit`.

L'ANPR peut renforcer la vérification mais n'est pas obligatoire pour qu'un premier déploiement RFID fonctionne.

## 6. Fonctionnement local et hors ligne

Chaque voie doit conserver un fonctionnement local sécurisé lorsque le réseau central est indisponible, selon une politique configurée.

Le contrôleur local peut conserver en cache limité :

- liste de tags autorisés ou bloqués ;
- catégories ;
- tarifs applicables ;
- droits d'abonnement ;
- plafonds hors ligne ;
- numéros de séquence ;
- horodatage ;
- règles de sécurité ;
- événements signés ou protégés contre l'altération.

Au retour du réseau :

- resynchronisation automatique ;
- déduplication ;
- absence de double débit ;
- conservation de l'ordre logique des événements ;
- remontée des écarts ;
- rapprochement avec les passages physiques ;
- génération d'alertes si nécessaire.

## 7. Abstraction matérielle multi-fournisseurs

Mansa ne dépend d'aucune marque unique de borne, lecteur, caméra, barrière ou terminal.

Les équipements sont pilotés derrière des adaptateurs. Les interfaces possibles incluent :

- API HTTP/REST ;
- webhook ;
- SDK constructeur ;
- Ethernet/TCP-IP ;
- RS-232 ;
- RS-485 ;
- MDB ;
- Pulse ;
- USB ;
- Wiegand lorsque pertinent ;
- relais/contact sec ;
- GPIO ;
- autre interface industrielle documentée.

Abstractions recommandées :

```text
KioskProvider
PaymentTerminalProvider
RFIDReaderProvider
ANPRProvider
BarrierProvider
LaneControllerProvider
VehicleSensorProvider
CashBillValidatorProvider
CashCoinValidatorProvider
CashRecyclerProvider
QrScannerProvider
ReceiptPrinterProvider
```

## 8. Trois niveaux d'équipement

Afin de ne pas imposer le même coût à tous les péages, trois niveaux doivent être supportés.

### Niveau 1 — Voie automatique complète

Peut inclure :

- borne double hauteur ou interfaces adaptées à plusieurs types de véhicules ;
- espèces avec validation et rendu de monnaie ;
- carte EMV/NFC ;
- QR ;
- Mobile Money ;
- imprimante ;
- interphone ;
- RFID ;
- ANPR ;
- classification automatique ;
- barrière ;
- capteurs ;
- contrôleur local ;
- supervision distante.

### Niveau 2 — Voie semi-automatique

La voie conserve un agent mais numérise les opérations critiques.

Elle peut inclure :

- terminal Mansa ;
- TPE ;
- scanner QR ;
- imprimante ;
- gestion sécurisée des espèces ;
- tiroir ou coffre contrôlé ;
- ouverture de barrière via contrôleur ;
- classification du véhicule ;
- journalisation complète.

Toute opération espèces doit être rapprochée de la transaction numérique et du passage physique.

### Niveau 3 — Poste numérisé à faible coût

Destiné aux sites à faible trafic ou aux premières phases de déploiement.

Il peut utiliser :

- tablette ou terminal Android durci ;
- application Mansa ;
- TPE externe ou intégré ;
- QR ;
- Mobile Money si activé ;
- reçu numérique ou petite imprimante ;
- commande de barrière via contrôleur local simple ;
- saisie contrôlée de la catégorie du véhicule.

Ce niveau doit conserver les mêmes principes d'identification, tarification et audit que les niveaux supérieurs.

## 9. Déploiement progressif

L'État ou le concessionnaire n'est pas obligé d'équiper tous les péages simultanément.

Le portail doit permettre une progression par :

- région ;
- axe routier ;
- réseau ;
- poste ;
- voie ;
- type d'équipement ;
- phase pilote ;
- lot contractuel.

Chaque site peut conserver temporairement une combinaison différente de voies : manuelles historiques, postes numérisés, voies semi-automatiques, voies automatiques et voies RFID.

Le système central doit agréger les transactions de tous les niveaux disponibles.

## 10. Deux modèles commerciaux

Mansa doit supporter au minimum deux modèles contractuels.

### Modèle 1 — Matériel acheté directement par l'État ou le concessionnaire

Le client achète ses bornes, barrières, TPE, lecteurs, caméras, capteurs et contrôleurs auprès de fournisseurs de son choix. Mansa fournit l'intégration logicielle, les adaptateurs, la configuration, la supervision et éventuellement la maintenance applicative.

### Modèle 2 — Matériel fourni, intégré ou revendu par Mansa

Mansa peut sourcer, intégrer ou revendre les équipements selon le contrat, tout en conservant l'indépendance logicielle vis-à-vis d'une marque unique.

Les contrats doivent distinguer clairement :

- prix matériel ;
- installation ;
- intégration ;
- licence ou service logiciel ;
- connectivité ;
- maintenance ;
- consommables ;
- pièces détachées ;
- SLA ;
- responsabilités de caisse et de collecte.

## 11. Marque blanche

L'interface et le matériel doivent pouvoir être personnalisés pour l'État ou un concessionnaire.

Éléments personnalisables :

- habillage des bornes ;
- couleurs ;
- logos ;
- écrans ;
- reçus ;
- tags RFID ;
- cartes ;
- signalétique de voie ;
- messages sonores ;
- langues ;
- documents d'assistance.

La mention `Propulsé par Mansa` est facultative et dépend de la politique commerciale ou institutionnelle convenue.

## 12. Anti-corruption et rapprochement obligatoire

Le système doit rapprocher au minimum :

`véhicule détecté → catégorie → tarif attendu → moyen de paiement → transaction → autorisation d'ouverture → ouverture effective → passage physique`.

Des contrôles doivent détecter :

- véhicule passé sans transaction ni droit valide ;
- tarif encaissé inférieur au tarif attendu ;
- catégorie modifiée manuellement de façon anormale ;
- ouverture de barrière sans autorisation Mansa ;
- paiement enregistré sans passage ;
- annulations répétées ;
- écarts de caisse ;
- réutilisation suspecte d'un reçu ;
- différence entre nombre de passages capteurs et nombre de transactions ;
- utilisation anormale d'un compte agent ;
- périodes de déconnexion anormalement longues.

Toute ouverture manuelle doit obligatoirement enregistrer :

- site et voie ;
- date/heure ;
- agent ou superviseur ;
- motif ;
- catégorie du véhicule si connue ;
- plaque ou référence disponible ;
- état des capteurs ;
- éventuelle photo ou preuve selon politique ;
- approbation supplémentaire si requise ;
- lien vers l'événement de passage.

Les journaux d'audit ne doivent pas être modifiables silencieusement.

## 13. Gestion des espèces

Lorsque les espèces sont acceptées, les billets et pièces XOF doivent être gérés par des équipements validés pour cette devise ou par une procédure semi-automatique auditée.

Pour les bornes automatiques :

- validateur de billets XOF ;
- validateur de pièces XOF ;
- rejet des espèces non reconnues ;
- cassettes sécurisées ;
- rendu de monnaie lorsque le matériel le permet ;
- télémétrie des niveaux de caisse ;
- alertes de remplissage/vidage ;
- journal d'ouverture du coffre ;
- rapprochement comptable.

La compatibilité XOF/BCEAO doit être confirmée et testée avec le fournisseur avant déploiement.

## 14. Tarification et catégories

Les tarifs sont administrés de manière centralisée mais peuvent être déclinés par réseau, poste, voie, catégorie de véhicule, période, abonnement ou régime spécial.

Chaque version tarifaire doit avoir :

- identifiant ;
- date de création ;
- date d'effet ;
- auteur ;
- périmètre ;
- statut ;
- historique ;
- justification ou référence réglementaire si pertinente.

Aucune modification tarifaire ne doit écraser l'historique des transactions antérieures.

## 15. Supervision nationale

Le portail État doit pouvoir visualiser :

- trafic par réseau, poste et voie ;
- recettes ;
- répartition par moyen de paiement ;
- taux d'utilisation RFID ;
- taux d'échec ;
- voies hors ligne ;
- équipements indisponibles ;
- écarts de caisse ;
- ouvertures manuelles ;
- alertes antifraude ;
- temps de passage ;
- disponibilité du service ;
- incidents ;
- synchronisations en attente ;
- état des barrières et contrôleurs ;
- versions de configuration.

Les rôles doivent respecter le principe du moindre privilège et séparer exploitation, finance, audit, maintenance et administration.

## 16. Sécurité et continuité

Les secrets matériels et API ne sont jamais stockés en clair dans Git.

Les communications doivent être authentifiées et chiffrées lorsque les interfaces le permettent. Les contrôleurs locaux doivent disposer d'une identité propre et être révocables.

Le système doit prévoir :

- rotation des secrets ;
- certificats ou clés par équipement ;
- journalisation ;
- mises à jour signées si possible ;
- segmentation réseau ;
- sauvegarde de configuration ;
- reprise après incident ;
- synchronisation fiable ;
- procédure de remplacement matériel.

## 17. Critères de recette d'une nouvelle voie

Avant mise en production, une voie doit faire l'objet d'une recette documentée couvrant au minimum :

- détection véhicule ;
- classification ;
- calcul du tarif ;
- chaque moyen de paiement activé ;
- fonctionnement RFID ;
- ouverture/fermeture barrière ;
- capteurs de sécurité ;
- reçu ;
- mode hors ligne ;
- reprise réseau ;
- absence de double débit ;
- ouverture manuelle ;
- journal d'audit ;
- remontée supervision ;
- panne d'un périphérique ;
- rapprochement transaction/passage ;
- compatibilité XOF si espèces ;
- tests voiture, utilitaire, bus et poids lourd selon la voie.

## 18. Règle de conception permanente

Mansa doit rester capable d'intégrer un équipement nouveau sans réécrire le moteur métier du péage. Les règles de paiement, de tarif, d'autorisation, de contrôle et d'audit restent dans les services Mansa ; les spécificités des fabricants restent confinées aux adaptateurs.
