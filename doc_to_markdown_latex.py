
import subprocess
import sys
import os

def convert_doc_to_markdown_latex(input_doc_path, output_md_path):
    """
    Converte un file .docx in un file Markdown con supporto LaTeX utilizzando pandoc.
    """
    if not os.path.exists(input_doc_path):
        print(f"Errore: Il file di input non esiste: {input_doc_path}")
        return

    try:
        # Comando pandoc per convertire .docx in markdown con estensioni LaTeX
        # --extract-media=. per estrarre immagini nella stessa directory
        command = [
            "pandoc",
            "--from=docx", # Modificato da 'doc' a 'docx'
            "--to=markdown_strict+tex_math_dollars+raw_tex",
            "--output", output_md_path,
            input_doc_path
        ]
        
        # Esegui il comando pandoc
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        print("Conversione completata con successo.")
        print("Output di Pandoc:", result.stdout)
        if result.stderr:
            print("Errori/Avvisi di Pandoc:", result.stderr)

    except subprocess.CalledProcessError as e:
        print(f"Errore durante la conversione con pandoc: {e}")
        print("Output standard:", e.stdout)
        print("Output di errore:", e.stderr)
    except FileNotFoundError:
        print("Errore: pandoc non trovato. Assicurati che sia installato e nel PATH.")
    except Exception as e:
        print(f"Si è verificato un errore inatteso: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Uso: python doc_to_markdown_latex.py <input_docx_path> <output_md_path>")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]
    convert_doc_to_markdown_latex(input_file, output_file)


