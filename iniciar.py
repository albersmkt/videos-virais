import getpass, os, runpy
from pathlib import Path
if not os.getenv("OPENAI_API_KEY"):
    print("Shark Reels | Cole sua chave da API OpenAI ou pressione Enter para usar a demonstração.")
    key=getpass.getpass("Chave (oculta): ").strip()
    if key:os.environ["OPENAI_API_KEY"]=key
runpy.run_path(str(Path(__file__).with_name("server.py")),run_name="__main__")
