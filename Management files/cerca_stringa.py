import os
import mmap
from concurrent.futures import ProcessPoolExecutor, as_completed


def cerca_in_file(percorso_file, stringa_bytes):
    """
    Cerca la stringa in un singolo file usando mmap (velocissimo).
    """
    try:
        with open(percorso_file, "rb", 0) as f:
            mm = mmap.mmap(f.fileno(), 0, access=mmap.ACCESS_READ)
            if mm.find(stringa_bytes) != -1:
                return percorso_file
    except Exception:
        return None
    return None


def cerca_stringa_in_file(directory_radice, stringa_da_cercare, workers=8):
    """
    Scorre ricorsivamente una directory e le sue sottodirectory
    alla ricerca di una stringa specifica nei file.

    Args:
        directory_radice (str): Directory da cui iniziare la ricerca.
        stringa_da_cercare (str): La stringa da cercare.
        workers (int): Numero di processi paralleli.
    """
    stringa_bytes = stringa_da_cercare.encode("utf-8")

    # Costruisco la lista dei file
    file_list = []
    for dirpath, _, nomi_file in os.walk(directory_radice):
        for nome_file in nomi_file:
            file_list.append(os.path.join(dirpath, nome_file))

    print(f"Trovati {len(file_list)} file da analizzare...")

    # Parallelizzo la ricerca
    risultati = []
    with ProcessPoolExecutor(max_workers=workers) as executor:
        future_to_file = {executor.submit(cerca_in_file, f, stringa_bytes): f for f in file_list}
        for future in as_completed(future_to_file):
            result = future.result()
            if result:
                risultati.append(result)
                print(f"✅ Stringa trovata in: {result}")

    return risultati


if __name__ == "__main__":
    directory_di_partenza = "."  # Directory corrente
    stringa_obiettivo = "I più popolari"  # Stringa da cercare

    print(
        f"🔍 Ricerca della stringa '{stringa_obiettivo}' "
        f"nella directory '{os.path.abspath(directory_di_partenza)}' e sottodirectory..."
    )

    trovati = cerca_stringa_in_file(
        directory_di_partenza,
        stringa_obiettivo,
        workers=os.cpu_count()  # Usa tutti i core disponibili
    )

    print("\n📌 Ricerca completata.")
    if trovati:
        print(f"👉 Stringa trovata in {len(trovati)} file:")
        for f in trovati:
            print("   -", f)
    else:
        print("❌ Nessun file trovato.")
