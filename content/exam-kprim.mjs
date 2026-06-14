const statement = (text, correct, explanation) => ({
  text,
  correct,
  explanation,
});

const question = (topicNumber, id, category, prompt, statements) => ({
  id: `${topicNumber}.X${id}`,
  topicNumber,
  category,
  prompt,
  statements,
});

export const topics = [
  { number: "01", name: "Datentypen, Literale und Konversionen" },
  { number: "02", name: "Operatoren, Ausdrücke und Kontrollfluss" },
  { number: "03", name: "Funktionen, Scope und Lebensdauer" },
  { number: "04", name: "Präprozessor, Build und Make" },
  { number: "05", name: "Arrays und Strings" },
  { number: "06", name: "Pointer und Pointerarithmetik" },
  { number: "07", name: "C-Deklarationen und Funktionspointer" },
  { number: "08", name: "Dynamischer Speicher und Ownership" },
  { number: "09", name: "Structs, Listen und Bitoperationen" },
  { number: "10", name: "Betriebssystem und System Calls" },
  { number: "11", name: "Filesystem und I/O" },
  { number: "12", name: "Prozesse, fork, exec und wait" },
  { number: "13", name: "Signale" },
  { number: "14", name: "Pipes, Queues, Shared Memory und Sockets" },
  { number: "15", name: "Threads und Lebenszyklus" },
  { number: "16", name: "Race Conditions, Mutex, Semaphore und Deadlock" },
];

export const questions = [
  question("01", "01", "Literale", "Beurteile die Aussagen zu Literalen und ihren Typen in C.", [
    statement("Das Stringliteral \"A\" enthält neben dem Zeichen A auch ein abschließendes NUL-Zeichen.", true, "Ein Stringliteral ist ein char-Array; \"A\" benötigt daher zwei Elemente: 'A' und '\\0'."),
    statement("Das gewöhnliche Zeichenliteral 'A' hat in C den Typ char.", false, "Ein gewöhnliches Zeichenliteral wie 'A' hat in C den Typ int."),
    statement("Das Integerliteral 037 bezeichnet den dezimalen Wert 31.", true, "Eine führende Null kennzeichnet ein Oktalliteral: 3·8 + 7 = 31."),
    statement("Passt ein unsuffigiertes Dezimalliteral nicht in int, wird als nächster Kandidat unsigned int gewählt.", false, "Bei Dezimalliteralen folgen long int und long long int; unsigned int gehört nicht zu dieser Kandidatenfolge."),
  ]),
  question("01", "02", "Konversionen", "Welche Aussagen über Grössen und übliche arithmetische Konversionen stimmen?", [
    statement("sizeof(char) ist per Definition 1, unabhängig davon, wie viele Bits ein Byte auf der Plattform hat.", true, "Der C-Standard definiert die Grösse von char als genau ein Byte."),
    statement("sizeof(int) ist auf jeder standardkonformen Plattform exakt 4.", false, "Der Standard legt Mindestbereiche, aber keine feste Bytegröße für int fest."),
    statement("Der Ausdruck 3 / 2 ergibt bei zwei Operanden vom Typ int den Wert 1.", true, "Ganzzahlige Division verwirft den Nachkommateil."),
    statement("Der Vergleich -1 < 1U ist wegen -1 immer wahr.", false, "Durch die übliche Konversion kann -1 zu einem großen unsigned-Wert werden; der Vergleich ist dann falsch."),
  ]),

  question("02", "01", "Operatoren", "Beurteile Seiteneffekte, Short-Circuit-Auswertung und Bitoperatoren.", [
    statement("Bei 0 && f() wird f() nicht aufgerufen.", true, "Der rechte Operand von && wird nicht ausgewertet, wenn der linke bereits falsch ist."),
    statement("Der Operator & besitzt dieselbe Short-Circuit-Semantik wie &&.", false, "& wertet beide Operanden aus und arbeitet bei Ganzzahlen bitweise."),
    statement("Der Ausdruck i = i++ ist eine portable Methode, i unverändert zu lassen.", false, "Die Änderung und weitere Verwendung von i sind nicht korrekt sequenziert; das Verhalten ist undefiniert."),
    statement("Der Ausdruck 5 & 3 ergibt den Wert 1.", true, "Binär gilt 0101 & 0011 = 0001."),
  ]),
  question("02", "02", "Kontrollfluss", "Welche Aussagen über Schleifen, switch und Sprünge sind korrekt?", [
    statement("Ein case-Label in einem switch benötigt einen ganzzahligen konstanten Ausdruck.", true, "case-Werte müssen zur Übersetzungszeit als ganzzahlige Konstanten bestimmbar sein."),
    statement("break beendet immer die gesamte Funktion.", false, "break beendet nur die innerste umgebende Schleife oder switch-Anweisung."),
    statement("continue in einer Schleife überspringt den Rest des aktuellen Durchlaufs und startet den nächsten.", true, "Bei for wird davor noch der Iterationsausdruck ausgeführt; bei while folgt die Bedingungsprüfung."),
    statement("Fehlt in einem switch nach einem case das break, ist Fall-through grundsätzlich ein Syntaxfehler.", false, "Fall-through ist erlaubt und manchmal beabsichtigt."),
  ]),

  question("03", "01", "return und Parameter", "Beurteile die Aussagen zu Funktionsaufrufen und return.", [
    statement("Ein mit return zurückgegebener Wert wird in C by value übergeben.", true, "Der berechnete Rückgabewert wird an den Aufrufer geliefert; C kennt keine Referenzrückgabe wie C++."),
    statement("Auch Pointerparameter werden beim Funktionsaufruf by value übergeben.", true, "Kopiert wird der Adresswert; über diese Kopie kann dennoch das referenzierte Objekt verändert werden."),
    statement("Eine void-Funktion darf mit return; vorzeitig verlassen werden.", true, "return ohne Ausdruck ist in einer void-Funktion zulässig."),
    statement("Fällt eine normale Funktion mit Rückgabetyp int ohne return aus dem Funktionsende, liefert sie automatisch -1.", false, "Ausser bei main führt das Verwenden des fehlenden Rückgabewerts zu undefiniertem Verhalten; -1 wird nicht automatisch eingesetzt."),
  ]),
  question("03", "02", "Scope und Storage", "Welche Aussagen zu Sichtbarkeit, Linkage und Lebensdauer stimmen?", [
    statement("Eine lokale static-Variable behält ihren Wert zwischen zwei Funktionsaufrufen.", true, "Sie hat Block-Scope, aber statische Speicherdauer."),
    statement("extern int counter; ist zwingend bereits die Definition, die Speicher für counter reserviert.", false, "Ohne Initialisierung ist dies typischerweise nur eine Deklaration; die Definition liegt anderswo."),
    statement("Ein Pointer auf eine lokale automatische Variable bleibt nach dem Funktionsende gültig, solange die Adresse gleich aussieht.", false, "Die Lebensdauer des Objekts endet; der Pointer wird dangling."),
    statement("Eine auf Dateiebene mit static deklarierte Funktion besitzt interne Linkage.", true, "Ihr Name ist nur innerhalb derselben Translation Unit sichtbar."),
  ]),

  question("04", "01", "Build-Pipeline", "Ordne Präprozessor, Compiler und Linker korrekt ein.", [
    statement("Der Präprozessor verarbeitet unter anderem #include und #define.", true, "Diese Direktiven werden vor der eigentlichen Übersetzung verarbeitet."),
    statement("Der Compiler kann aus einer präprozessierten C-Quelldatei eine Objektdatei erzeugen.", true, "Die Objektdatei enthält Maschinencode und noch nicht zwingend aufgelöste externe Symbole."),
    statement("Der Linker expandiert Include Guards in Headerdateien.", false, "Include Guards sind Präprozessorlogik."),
    statement("Eine Objektdatei ist grundsätzlich bereits ein vollständig gelinktes, direkt ausführbares Programm.", false, "Externe Referenzen und Startcode müssen typischerweise noch durch den Linker aufgelöst werden."),
  ]),
  question("04", "02", "Make", "Welche Aussagen über Regeln und automatische Variablen in Make stimmen?", [
    statement("In einer Regel target: prerequisites wird das Target neu gebaut, wenn es fehlt oder eine Voraussetzung neuer ist.", true, "Das ist das zentrale zeitstempelbasierte Abhängigkeitsmodell von make."),
    statement("$@ steht in einer Recipe typischerweise für den Namen des Targets.", true, "$@ ist eine automatische Variable für das aktuelle Ziel."),
    statement("$< bezeichnet immer die Liste aller Voraussetzungen.", false, "$< steht normalerweise für die erste Voraussetzung; $^ enthält die Liste aller Voraussetzungen."),
    statement(".PHONY sorgt dafür, dass ein Target nur gebaut wird, wenn eine gleichnamige Datei existiert.", false, "Ein phony Target gilt gerade unabhängig von einer gleichnamigen Datei als auszuführendes Ziel."),
  ]),

  question("05", "01", "sizeof und Array-Decay", "Beurteile Arrays im lokalen Scope und als Funktionsparameter.", [
    statement("Bei int a[10]; im selben Block liefert sizeof(a) die Grösse aller zehn int-Elemente.", true, "Hier ist a noch das Arrayobjekt und nicht zu einem Pointer zerfallen."),
    statement("In void f(int a[10]) liefert sizeof(a) zuverlässig die Grösse von zehn int.", false, "Ein Arrayparameter wird als Pointerparameter behandelt; sizeof(a) misst dort den Pointer."),
    statement("Für int a[3][4] hat a nach Array-Decay den Typ Pointer auf Array von vier int.", true, "Der resultierende Typ ist int (*)[4]."),
    statement("Ein zweidimensionales Array int a[3][4] ist ohne Weiteres typkompatibel zu int **.", false, "Die Speicher- und Typstruktur eines zusammenhängenden 2D-Arrays unterscheidet sich von int **."),
  ]),
  question("05", "02", "Strings", "Welche Aussagen über C-Strings und Stringliterale sind korrekt?", [
    statement("strlen(\"abc\") liefert 3 und zählt das abschließende NUL-Zeichen nicht mit.", true, "strlen zählt Zeichen vor dem ersten '\\0'."),
    statement("char s[3] = \"abc\"; erzeugt einen vollständig NUL-terminierten C-String.", false, "Das Array hat nur Platz für a, b und c; ein NUL-Zeichen passt nicht mehr hinein."),
    statement("Der Versuch, ein Stringliteral über einen Pointer zu verändern, führt zu undefiniertem Verhalten.", true, "Stringliterale dürfen nicht modifiziert werden."),
    statement("strcmp(a, b) liefert genau dann 1, wenn a lexikografisch größer als b ist.", false, "Garantiert ist nur ein positiver Wert, nicht zwingend exakt 1."),
  ]),

  question("06", "01", "Pointerarithmetik", "Welche Regeln der Pointerarithmetik sind korrekt?", [
    statement("Bei int *p verschiebt p + 1 die Adresse um sizeof(int) Bytes.", true, "Pointerarithmetik skaliert mit der Grösse des Zieltyps."),
    statement("Zwei Pointer dürfen portabel subtrahiert werden, auch wenn sie auf unabhängige Objekte zeigen.", false, "Definiert ist die Subtraktion nur innerhalb desselben Arrays beziehungsweise bis one-past."),
    statement("Ein one-past-the-end-Pointer darf gebildet und verglichen, aber nicht dereferenziert werden.", true, "Er dient als Grenzwert für Iteration, zeigt aber auf kein Element."),
    statement("Arithmetik auf void * ist im ISO-C-Standard definiert, weil void immer die Größe 1 hat.", false, "void hat keine Objektgröße; void-Pointerarithmetik ist nur eine Compilererweiterung mancher Systeme."),
  ]),
  question("06", "02", "const und Pointer", "Lies die const-Qualifizierungen genau.", [
    statement("Bei const int *p darf über p der int-Wert nicht verändert werden, p selbst aber schon.", true, "p ist ein veränderbarer Pointer auf const int."),
    statement("Bei int * const p ist der Pointerwert konstant, das referenzierte int darf aber verändert werden.", true, "const bindet hier an den Pointer selbst."),
    statement("Nach int *p = NULL; ist *p ein gültiger lvalue für die erste Zuweisung.", false, "Das Dereferenzieren eines Nullpointers ist undefiniert."),
    statement("Zwei Pointer mit verschiedenem Zieltyp können ohne Cast beliebig voneinander subtrahiert werden.", false, "Pointerarithmetik verlangt passende Typen und dieselbe Arrayzugehörigkeit."),
  ]),

  question("07", "01", "Deklaratoren", "Welche Übersetzungen der C-Deklarationen stimmen?", [
    statement("float (*a)(int); deklariert a als Pointer auf eine Funktion mit int-Parameter und float-Rückgabewert.", true, "Die Klammern binden *a vor dem Funktionssuffix."),
    statement("float *a(int); deklariert a als Pointer auf eine Funktion.", false, "a ist hier eine Funktion, die int nimmt und float * zurückgibt."),
    statement("double *a[5]; deklariert ein Array mit fünf Pointern auf double.", true, "Das Array-Suffix bindet stärker als der Stern."),
    statement("double (*a)[5]; deklariert ein Array mit fünf Pointern auf double.", false, "a ist ein Pointer auf ein Array von fünf double."),
  ]),
  question("07", "02", "Funktionspointer", "Gesucht sind Funktionspointer und Arrays davon.", [
    statement("float (*tab[10])(int); deklariert ein Array aus zehn Pointern auf passende Funktionen.", true, "tab[10] ist das Array; jedes Element (*...) zeigt auf eine Funktion int -> float."),
    statement("float *tab[10](int); ist eine gültige Deklaration eines Arrays aus zehn Funktionen.", false, "Funktionen können keine Arrays zurückgeben und Arrays aus Funktionen sind nicht zulässig."),
    statement("float (**p)(int); kann einen Pointer auf einen Funktionspointer deklarieren.", true, "Zwei Sterne bedeuten zwei Indirektionsebenen vor dem Funktionsdeklarator."),
    statement("Nach typedef float (*Fn)(int); deklariert Fn tab[10]; ein Array aus zehn passenden Funktionspointern.", true, "Fn ist ein Alias für den vollständigen Funktionspointertyp."),
  ]),

  question("08", "01", "malloc, calloc und realloc", "Beurteile die dynamische Speicherverwaltung.", [
    statement("malloc initialisiert den reservierten Speicher nicht automatisch.", true, "Der Inhalt ist unbestimmt, bis das Programm ihn initialisiert."),
    statement("calloc(n, size) reserviert Speicher für n Elemente und setzt alle Bytes auf null.", true, "calloc führt Reservierung und Byte-Initialisierung zusammen aus."),
    statement("Schlägt realloc(p, n) fehl, wird der ursprüngliche Block p automatisch freigegeben.", false, "Bei Fehlschlag liefert realloc NULL und der alte Block bleibt gültig."),
    statement("free(NULL) ist undefiniertes Verhalten.", false, "free darf mit NULL aufgerufen werden und tut dann nichts."),
  ]),
  question("08", "02", "Ownership", "Welche Aussagen zu Lebensdauer und Ownership sind korrekt?", [
    statement("Für eine Kopie eines C-Strings s werden mindestens strlen(s) + 1 Bytes benötigt.", true, "Das zusätzliche Byte ist für das abschließende '\\0'."),
    statement("Ein zweites free auf denselben noch unveränderten Pointer ist erlaubt, wenn dazwischen kein malloc stattfand.", false, "Double-free ist undefiniertes Verhalten."),
    statement("Nach erfolgreichem realloc können alte Alias-Pointer auf den ursprünglichen Block ungültig sein.", true, "realloc darf den Block verschieben; nur der zurückgegebene Pointer ist massgeblich."),
    statement("Das Setzen von p = NULL nach free(p) macht alle anderen Alias-Pointer auf denselben Block ebenfalls sicher.", false, "Nur p wird geändert; andere Aliase bleiben dangling."),
  ]),

  question("09", "01", "struct und typedef", "Welche Aussagen zu Strukturen und Typaliasen stimmen?", [
    statement("Eine Zuweisung zwischen zwei Objekten desselben struct-Typs kopiert die Member by value.", true, "Strukturzuweisung kopiert den gesamten Strukturwert."),
    statement("sizeof(struct S) muss exakt der Summe der sizeof-Werte aller Member entsprechen.", false, "Alignment kann Padding zwischen oder nach Membern einfügen."),
    statement("typedef struct Node Node; reserviert bereits Speicher für ein Node-Objekt.", false, "typedef führt nur einen Typalias ein."),
    statement("Der Ausdruck p->value ist äquivalent zu (*p).value.", true, "Der Pfeiloperator kombiniert Dereferenzierung und Memberzugriff."),
  ]),
  question("09", "02", "Listen und Bits", "Beurteile Pointerübergabe und typische Bitmasken.", [
    statement("Soll eine Funktion den head-Pointer einer Liste beim Aufrufer ersetzen, kann sie Node **head erhalten.", true, "Über die zusätzliche Indirektion kann die Pointervariable des Aufrufers geändert werden."),
    statement("x |= mask setzt alle in mask markierten Bits in x.", true, "Ein OR mit 1 setzt das jeweilige Bit."),
    statement("x &= mask löscht genau die in mask gesetzten Bits und lässt alle anderen unverändert.", false, "Zum gezielten Löschen verwendet man x &= ~mask."),
    statement("x ^= mask setzt die markierten Bits unabhängig vom vorherigen Zustand immer auf 1.", false, "XOR invertiert die markierten Bits."),
  ]),

  question("10", "01", "User- und Kernel-Mode", "Welche Aussagen über Betriebssystemschutz und System Calls stimmen?", [
    statement("Ein User-Programm fordert privilegierte Kernel-Dienste über definierte System-Call-Schnittstellen an.", true, "Der kontrollierte Übergang schützt Kernel und andere Prozesse."),
    statement("Eine Library-Funktion kann einen System Call kapseln, ohne selbst der Kernel zu sein.", true, "Wrapper bereiten Argumente vor und führen den kontrollierten Übergang aus."),
    statement("Virtuelle Adressräume erlauben jedem Prozess direkten Schreibzugriff auf den Kernel-Speicher.", false, "Speicherschutz verhindert genau solche beliebigen Zugriffe."),
    statement("Jeder Aufruf einer C-Standard-Library-Funktion verursacht zwingend genau einen System Call.", false, "Viele Library-Funktionen arbeiten vollständig im User Space oder puffern mehrere Operationen."),
  ]),
  question("10", "02", "Fehlerbehandlung", "Beurteile Rückgabewerte und errno bei systemnahen Funktionen.", [
    statement("errno sollte nur ausgewertet werden, wenn der Rückgabewert einer Funktion einen Fehler meldet.", true, "Ein erfolgreicher Aufruf muss errno nicht auf null setzen."),
    statement("perror kann eine Meldung passend zum aktuellen errno-Wert ausgeben.", true, "perror kombiniert einen Präfixtext mit der Fehlerbeschreibung."),
    statement("Nach jedem erfolgreichen Systemaufruf ist errno garantiert 0.", false, "Ein alter errno-Wert darf bestehen bleiben."),
    statement("POSIX-Funktionen signalisieren jeden Fehler ausschließlich durch den Rückgabewert NULL.", false, "Je nach Funktion werden etwa -1, NULL oder Fehlercodes verwendet."),
  ]),

  question("11", "01", "File Descriptor und Stream", "Unterscheide POSIX-Deskriptoren von stdio-Streams.", [
    statement("stdin, stdout und stderr entsprechen üblicherweise den File Descriptors 0, 1 und 2.", true, "Das sind die konventionellen Standarddeskriptoren eines Prozesses."),
    statement("open liefert bei Erfolg einen int-File-Descriptor.", true, "POSIX-I/O arbeitet mit kleinen ganzzahligen Handles."),
    statement("FILE * und int-File-Descriptor sind exakt derselbe Typ und ohne Konvertierung austauschbar.", false, "FILE * ist eine gepufferte stdio-Abstraktion über einer tieferen Ressource."),
    statement("fclose schliesst nur den Kernel-Deskriptor und verwirft einen noch nicht geschriebenen stdio-Puffer grundsätzlich.", false, "fclose versucht den Stream zu flushen und schliesst danach die Ressource."),
  ]),
  question("11", "02", "read und write", "Welche Aussagen über POSIX-I/O sind korrekt?", [
    statement("read kann weniger Bytes liefern als angefordert, ohne dass ein Fehler vorliegt.", true, "Kurze Reads sind etwa bei Pipes, Terminals oder Dateiende normal."),
    statement("Ein Rückgabewert 0 von read bedeutet bei einer regulären Datei typischerweise EOF.", true, "Es wurden keine weiteren Bytes gelesen."),
    statement("write schreibt bei Erfolg immer die gesamte angeforderte Bytezahl.", false, "Auch write kann kurz schreiben; robuster Code verwendet eine Schleife."),
    statement("lseek funktioniert für jede Art von File Descriptor, insbesondere auch für Pipes.", false, "Pipes und manche andere Deskriptoren sind nicht seekable."),
  ]),

  question("12", "01", "fork und wait", "Beurteile das Verhalten nach fork.", [
    statement("Nach erfolgreichem fork erhält das Child 0 und der Parent die positive PID des Childs.", true, "Die unterschiedlichen Rückgabewerte trennen die Kontrollflüsse."),
    statement("Parent und Child teilen nach fork dieselben normalen globalen Variablen als gemeinsam beschreibbaren Speicher.", false, "Sie besitzen logisch getrennte virtuelle Adressräume."),
    statement("Drei von allen entstehenden Prozessen ausgeführte, erfolgreiche fork-Aufrufe können acht Prozesse ergeben.", true, "Jeder unbedingte fork verdoppelt die Prozesszahl: 2³ = 8."),
    statement("waitpid kann einen beendeten Child-Prozess reap-en und dessen Status liefern.", true, "Damit verhindert der Parent unter anderem dauerhaft verbleibende Zombies."),
  ]),
  question("12", "02", "exec", "Welche Aussagen über die exec-Familie stimmen?", [
    statement("Ein erfolgreicher exec-Aufruf ersetzt das Prozessabbild und kehrt nicht zum alten Code zurück.", true, "Code, Daten, Heap und Stack werden durch das neue Programm ersetzt."),
    statement("Nach erfolgreichem exec besitzt das neue Programm zwingend eine neue PID.", false, "Es bleibt derselbe Prozess mit derselben PID."),
    statement("Offene File Descriptors können exec überleben, sofern FD_CLOEXEC nicht gesetzt ist.", true, "Das ermöglicht gezielte Descriptor-Vererbung an das neue Programm."),
    statement("exec erzeugt zuerst automatisch einen zusätzlichen Child-Prozess.", false, "Für einen neuen Prozess wird typischerweise fork mit exec kombiniert; exec selbst erzeugt keinen."),
  ]),

  question("13", "01", "Signalbehandlung", "Welche Aussagen über Signalhandler und sigaction sind korrekt?", [
    statement("SIGKILL und SIGSTOP können nicht durch einen eigenen Handler abgefangen werden.", true, "Diese Signale bleiben der Kontrolle des Kernels vorbehalten."),
    statement("sigaction erlaubt unter anderem, Handler, Signalmaske und Flags gemeinsam festzulegen.", true, "Damit ist die Konfiguration präziser als mit der einfachen signal-Schnittstelle."),
    statement("Innerhalb eines Signalhandlers sind beliebige stdio-Funktionen bedenkenlos verwendbar.", false, "Es dürfen nur async-signal-safe Funktionen zuverlässig aufgerufen werden."),
    statement("Jedes mehrfach eintreffende gewöhnliche Signal wird zwingend als eigene Instanz in einer unbegrenzten Queue gespeichert.", false, "Gewöhnliche Signale können zusammengefasst werden; Real-Time-Signale besitzen andere Queue-Eigenschaften."),
  ]),
  question("13", "02", "Signalzustand", "Beurteile Blockieren, Senden und Vererbung von Signalen.", [
    statement("Ein blockiertes Signal kann pending bleiben und später nach dem Entblocken zugestellt werden.", true, "Blockieren bedeutet nicht automatisch Verwerfen."),
    statement("kill(pid, SIGTERM) beendet den Zielprozess in jedem Fall sofort.", false, "SIGTERM kann behandelt, blockiert oder ignoriert werden."),
    statement("Signaldispositionen werden grundsätzlich über fork an das Child vererbt.", true, "Das Child startet mit Kopien der Signaldispositionen des Parents."),
    statement("Ein erfolgreicher exec behält alle benutzerdefinierten Signalhandler unverändert bei.", false, "Abgefangene Signale werden bei exec grundsätzlich auf Default zurückgesetzt; ignorierte bleiben typischerweise ignoriert."),
  ]),

  question("14", "01", "Pipes", "Welche Aussagen über anonyme Pipes stimmen?", [
    statement("Eine klassische anonyme Pipe stellt einen unidirektionalen Byte-Stream bereit.", true, "Für Kommunikation in beide Richtungen werden typischerweise zwei Pipes benötigt."),
    statement("Eine Pipe bewahrt automatisch die Grenzen einzelner write-Aufrufe als Nachrichten.", false, "Sie ist ein Byte-Stream ohne allgemeine Message-Grenzen."),
    statement("Der Leser erkennt EOF erst, wenn alle offenen Schreibenden der Pipe geschlossen sind.", true, "Ein irgendwo offenes Schreibende kann das EOF verhindern."),
    statement("Nach fork sollten beide Prozesse grundsätzlich beide Pipe-Enden offen behalten.", false, "Nicht benötigte Enden müssen geschlossen werden, damit Blockierung und EOF korrekt funktionieren."),
  ]),
  question("14", "02", "IPC-Auswahl", "Ordne Eigenschaften verschiedener IPC-Mechanismen zu.", [
    statement("POSIX Message Queues bewahren Nachrichtengrenzen und können Prioritäten unterstützen.", true, "Anders als Pipes transportieren sie strukturierte einzelne Nachrichten."),
    statement("Shared Memory verhindert Race Conditions automatisch, weil beide Prozesse denselben Bereich sehen.", false, "Gerade wegen des gemeinsamen Zugriffs ist zusätzliche Synchronisation nötig."),
    statement("Ein Stream-Socket kann bidirektionale Kommunikation über eine Verbindung ermöglichen.", true, "TCP- und Unix-Stream-Sockets sind typische Beispiele."),
    statement("Eine Named Pipe kann ausschließlich zwischen Parent und direktem Child verwendet werden.", false, "Über den FIFO-Pfad können auch nicht verwandte Prozesse kommunizieren."),
  ]),

  question("15", "01", "Thread-Ressourcen", "Welche Ressourcen teilen Threads desselben Prozesses?", [
    statement("Threads desselben Prozesses teilen grundsätzlich globale Daten und Heap.", true, "Sie laufen im gemeinsamen virtuellen Adressraum."),
    statement("Jeder Thread besitzt einen eigenen Stack und eigenen Registerzustand.", true, "Diese Zustände gehören zum jeweiligen Ausführungskontext."),
    statement("Jeder Thread erhält automatisch eine private Kopie aller File Descriptors.", false, "Die Descriptor-Tabelle gehört grundsätzlich zum Prozess und wird geteilt."),
    statement("Eine Race Condition ist zwischen Threads ausgeschlossen, weil sie zum selben Prozess gehören.", false, "Der geteilte Speicher macht Race Conditions gerade besonders relevant."),
  ]),
  question("15", "02", "join und detach", "Beurteile den Lebenszyklus von POSIX-Threads.", [
    statement("pthread_join kann auf einen joinable Thread warten und dessen Rückgabepointer übernehmen.", true, "Der Join sammelt zugleich die Thread-Ressourcen ein."),
    statement("Ein erfolgreich detached Thread kann später normal mit pthread_join eingesammelt werden.", false, "Detached Threads sind nicht joinable und geben ihre Ressourcen selbst frei."),
    statement("pthread_exit im Main-Thread kann den Prozess weiterlaufen lassen, solange andere Threads aktiv sind.", true, "Anders als return aus main beendet pthread_exit nur den aufrufenden Thread."),
    statement("Derselbe joinable Thread darf von beliebig vielen Threads erfolgreich gejoint werden.", false, "Ein Thread darf nur einmal erfolgreich gejoint werden; Mehrfach-Join ist nicht zulässig."),
  ]),

  question("16", "01", "Race und Mutex", "Welche Aussagen über Critical Sections und Mutexes stimmen?", [
    statement("Eine Race Condition hängt davon ab, in welcher zeitlichen Reihenfolge konkurrierende Zugriffe stattfinden.", true, "Das Resultat wird durch nicht deterministisches Interleaving beeinflusst."),
    statement("volatile macht eine gemeinsam veränderte Variable automatisch threadsicher.", false, "volatile ersetzt weder Atomics noch Synchronisationsprimitive."),
    statement("Nach erfolgreichem pthread_mutex_lock muss auf jedem möglichen Kontrollpfad ein passender Unlock erfolgen.", true, "Auch Fehler- und Early-Return-Pfade dürfen den Mutex nicht dauerhaft halten."),
    statement("Ein Mutex verhindert automatisch jeden Deadlock im gesamten Programm.", false, "Mehrere Mutexes und falsche Lock-Reihenfolgen können selbst Deadlocks erzeugen."),
  ]),
  question("16", "02", "Semaphore und Deadlock", "Beurteile Zählsemaphoren und Deadlock-Bedingungen.", [
    statement("Eine mit N initialisierte Counting Semaphore kann bis zu N gleichzeitige Permits modellieren.", true, "Jede wait/down-Operation verbraucht ein verfügbares Permit."),
    statement("Eine post/up-Operation muss zwingend vom selben Thread ausgeführt werden, der zuvor wait/down aufgerufen hat.", false, "Semaphoren besitzen typischerweise keine Mutex-Ownership und eignen sich zur Signalisierung zwischen Threads."),
    statement("Eine globale Reihenfolge beim Anfordern mehrerer Locks kann Circular Wait verhindern.", true, "Ohne Kreis fehlt eine notwendige Deadlock-Bedingung."),
    statement("Hold-and-wait allein beweist bereits, dass ein Deadlock vorliegt.", false, "Für einen Deadlock müssen weitere Bedingungen, insbesondere Circular Wait, gemeinsam erfüllt sein."),
  ]),
];
