import os


def cerca_stringa_in_file(directory_radice, stringa_da_cercare):
    """
    Scorre ricorsivamente una directory e le sue sottodirectory alla ricerca di una stringa specifica nei file.

    Args:
        directory_radice (str): Il percorso della directory da cui iniziare la ricerca.
        stringa_da_cercare (str): La stringa da cercare all'interno dei file.
    """
    for dirpath, _, nomi_file in os.walk(directory_radice):
        for nome_file in nomi_file:
            percorso_file = os.path.join(dirpath, nome_file)
            try:
                with open(percorso_file, 'r', encoding='utf-8', errors='ignore') as file:
                    if stringa_da_cercare in file.read():
                        print(f"Stringa trovata in: {percorso_file}")
            except Exception as e:
                print(f"Impossibile leggere il file {percorso_file}: {e}")


if __name__ == "__main__":
    directory_di_partenza = '.'  # '.' indica la directory corrente
    stringa_obiettivo = "{/* Includi un link al tuo CSS per uno stile accurato */}"

    print(
        f"Ricerca della stringa '{stringa_obiettivo}' nella directory '{os.path.abspath(directory_di_partenza)}' e sottodirectory...")
    cerca_stringa_in_file(directory_di_partenza, stringa_obiettivo)
    print("Ricerca completata.")