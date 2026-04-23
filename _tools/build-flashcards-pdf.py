#!/usr/bin/env python3
"""
Build the Brazilian Listening Lab Vocabulary Flashcards as a printable
PDF-ready HTML. One consolidated deck covering all 50 dialogues (since
higher tiers include everything lower tiers have, a single "full" deck
serves every paid buyer).

Layout: 4 flashcards per page (420px × 747px). Per-term semantic emoji
mapping — NOT per dialogue theme — so each card's icon actually relates
to the word.

Usage:
  python _tools/build-flashcards-pdf.py
"""

import re
import sys
from pathlib import Path

# Force UTF-8 on stdout so emoji/accented prints work on Windows (default cp1252 chokes).
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")

REPO_ROOT = Path(__file__).resolve().parent.parent
DIALOGUES_MD = REPO_ROOT / "brazilian-listening-lab" / "audio-scripts" / "dialogues.md"
OUTPUT_DIR = REPO_ROOT / "brazilian-listening-lab"


# ── Semantic emoji mapper ─────────────────────────────────────────
#
# Rules are checked in order, first-match wins. Each rule is a list
# of keywords (lowercase); if ANY keyword appears in the haystack
# (PT term + EN note lowered), the rule's emoji is assigned.
# Order from SPECIFIC → GENERAL so compound phrases beat single words.

EMOJI_RULES: list[tuple[list[str], str]] = [
    # ── Very specific multi-word expressions / idioms ──
    (["cheers", "toast", "brinde"], "🥂"),
    (["kiss", "manda um beijo", "beijo"], "💋"),
    (["heart", "coração", "i love you", "te amo"], "❤️"),
    (["conquer the world", "conquistar o mundo"], "🌍"),
    (["melting", "derretendo"], "🫠"),
    (["destroyed", "wrecked", "destruído"], "😵"),
    (["binge", "maratonei", "maratona"], "📺"),
    (["subtitles", "legenda"], "🎞️"),
    (["addicted", "hooked", "addictive", "viciad"], "🎬"),
    (["stop it", "trying not to cry", "emotional"], "🥲"),
    (["kill it", "crush it", "arrasa"], "💪"),
    (["you'll be missed", "saudade", "missing", "missed"], "💙"),
    (["welcome", "bem-vindo"], "🎉"),
    (["have fun", "boa diversão"], "🎉"),
    (["awesome", "perfect day", "vai ser demais", "que dia perfeito"], "✨"),
    (["promise is a debt", "promessa é dívida"], "🤝"),
    (["trust the process", "confia no processo", "confiar no processo"], "🌱"),
    (["take care", "se cuida"], "💚"),
    (["drown the sorrows", "afogar as mágoas"], "😢"),
    (["suffering", "sofrendo"], "😔"),
    (["hopefully", "tomara"], "🤞"),
    (["we'll see", "vamos ver"], "🤷"),

    # ── Food & drink (specific before general) ──
    (["cooler", "caixa térmica"], "🧊"),
    # Restaurant bill / service charge context
    (["the bill", "the bill/check", "a conta"], "🧾"),
    (["split (the bill)", "dividir the bill", "all together", "tudo junto"], "🧾"),
    (["service charge", "10%", "dez por cento"], "💵"),
    (["it's up to you", "fica a seu critério"], "🤷"),
    (["negotiating", "will you do seven", "me faz sete", "a gente fecha"], "🤝"),
    (["open bar"], "🍻"),
    (["general admission", "standing area", "vip section", "balcony", "camarote", "pista"], "🎤"),
    (["good customer", "loyal customer", "cliente boa"], "🤝"),
    (["breakfast", "café da manhã"], "🍳"),
    (["coconut water", "água de coco"], "🥥"),
    (["roast chicken", "frango assado", "frango"], "🍗"),
    (["potato salad", "maionese de batata", "vinagrete", "salada"], "🥗"),
    (["cornmeal cake", "bolo de fubá", "cake", "bolo", "pudim", "petit gâteau", "flan", "dessert"], "🍰"),
    (["snacks", "salgadinhos", "finger food"], "🥨"),
    (["coffee", "café", "cafezinho"], "☕"),
    (["beer", "cerveja", "brahma", "heineken", "chopp", "gelada"], "🍺"),
    (["bread", "pão", "pães", "pãezinhos", "rolls", "loaf", "bakery", "padaria"], "🍞"),
    (["came out of the oven", "forno", "oven"], "🔥"),
    (["menu", "cardápio"], "📋"),
    (["fruits", "fruta"], "🍎"),
    (["dairy", "laticínio", "milk", "leite"], "🥛"),
    (["help yourself", "pode se servir", "eat", "come que esfria"], "🍴"),
    (["dish", "prato", "porção", "restaurant", "restaurante", "japonês", "food", "comida"], "🍽️"),
    (["sweet", "docinha"], "🍬"),

    # ── Transportation ──
    (["boarding pass", "cartão de embarque"], "🎟️"),
    (["flight", "board", "embarcar", "realocar", "rebook", "rebooking", "rerouting", "reacomodação", "voo"], "✈️"),
    (["checked luggage", "bagagem despachada", "mala despachada", "luggage", "bagagem"], "🧳"),
    (["bus", "ônibus"], "🚌"),
    (["metro", "metrô", "subway", "station", "estação"], "🚇"),
    (["license plate", "placa"], "🚔"),
    (["ticket", "bilhete", "passagem"], "🎫"),
    (["uber", "driver", "motorista", "passenger", "passageiro", "corridas", "rides", "car ", "ride"], "🚗"),
    (["take the bus", "pega o", "catch the bus"], "🚌"),
    (["traffic", "trânsito", "preso no trânsito", "parking lot", "estacionamento", "marginal"], "🚦"),
    (["take a walk", "dar uma volta", "walked too far", "andei demais", "you passed it"], "🚶"),
    (["lost", "perdido"], "🗺️"),

    # ── Compound phrases that would otherwise be stolen by generic rules below ──
    (["left on good terms", "saí numa boa"], "👋"),
    (["room to grow", "dá pra crescer"], "📈"),
    (["salary floor", "salary piso", "minimum salary"], "💰"),

    # ── Directions ──
    (["left", "esquerda", "right (direction)", "direita", "straight", "segue reto", "reto"], "🧭"),
    (["turn", "vira"], "↪️"),
    (["block", "blocks", "quadra"], "🗺️"),
    (["close", "pertinho", "perto", "near"], "📍"),
    (["downtown", "centro"], "🏙️"),
    (["in the back", "lá no fundo", "on the left side", "do lado"], "📍"),
    (["you'll end up right on", "cair direto"], "📍"),

    # ── Health ──
    (["pharmacy", "farmácia"], "💊"),
    (["medicine", "remédio", "pill", "comprimido", "dipirona"], "💊"),
    (["headache", "dor de cabeça"], "🤕"),
    (["back pain", "dor nas costas"], "🤕"),
    (["chest pain", "dor no peito", "shortness of breath", "falta de ar", "high blood pressure", "pressão alta"], "💔"),
    (["wheelchair", "cadeira de rodas"], "🦽"),
    (["ecg", "eletro", "eletrocardiograma"], "❤️"),
    (["wake", "examination table", "maca"], "🛏️"),
    (["muscle", "muscular", "tension", "tensão", "doms", "delayed onset", "body finds"], "💪"),
    (["prescribe", "vou te passar", "refer", "encaminhar"], "📝"),
    (["appointment", "consulta", "schedule an appointment", "marcar uma consulta"], "🩺"),
    (["doctor", "médico", "doutor", "doctor"], "🩺"),
    (["allergy", "alergia"], "🤧"),
    (["health insurance", "plano de saúde"], "🏥"),
    (["get well", "melhoras"], "💚"),
    (["pain", "dor", "not going away", "not tá passando"], "😣"),
    (["nothing serious", "nada grave"], "😌"),
    (["update", "novidade"], "📣"),
    (["feeling very sick", "feeling sick", "passando mal"], "🤢"),

    # ── Beach & summer ──
    (["sunburned", "queimei", "sunscreen", "protetor", "sun is unforgiving", "sol não perdoa", "sun", "sol"], "☀️"),
    (["beach umbrella", "guarda-sol", "umbrella"], "⛱️"),
    (["beach stand", "barraca"], "🏖️"),
    (["heat index", "sensação térmica", "heat"], "🌡️"),

    # ── Weather ──
    (["weather conditions", "condições meteorológicas"], "🌦️"),
    (["broke down", "pifou"], "🔌"),

    # ── Phone / tech ──
    (["cracked screen", "tela trincada", "screen replacement", "troca da tela", "touchscreen", "touch"], "📱"),
    (["cell phone store", "loja de celular"], "📱"),
    (["imei", "carrier", "operadora", "celular"], "📱"),
    (["internet", "dropped", "caiu", "router", "roteador", "wiring", "cabeamento", "restarted", "reiniciei"], "📶"),
    (["wi-fi", "wifi", "password", "senha"], "🔒"),
    (["message", "whatsapp", "mensagem", "me manda"], "💬"),
    (["social media", "redes sociais"], "📲"),
    (["holder", "titular"], "👤"),
    (["track", "rastrear"], "📡"),

    # ── Money & payments ──
    (["pix"], "💸"),
    (["debit card", "débito"], "💳"),
    (["card machine", "na máquina", "you can tap", "pode aproximar", "contactless"], "💳"),
    (["installment", "parcela", "parcelei", "sem juros", "no interest"], "💳"),
    (["exchange rate", "câmbio", "currency"], "💱"),
    (["fee", "taxa", "cobra taxa"], "💰"),
    (["refund", "reembolso"], "💸"),
    (["deposit", "caução"], "🏦"),
    (["guarantor", "fiador", "seguro-fiança"], "📝"),
    (["full refund", "voucher"], "🧾"),
    (["receipt", "invoice", "nota fiscal"], "🧾"),
    (["bank statement", "extrato bancário", "checking account", "conta corrente"], "🏦"),
    (["electricity bill", "conta de luz"], "💡"),
    (["proof of", "comprovante"], "📄"),
    (["how much", "quanto custa", "quanto fica", "quanto saiu", "tava quanto", "sai por", "tá saindo", "saía mais caro", "price", "costs", "comes to"], "💰"),
    (["cheap", "barato", "what a deal", "que barato", "ends up cheaper"], "💰"),
    (["spent too much", "gastei demais"], "💸"),
    (["sale", "promoções"], "🏷️"),
    (["five stars", "cinco estrelas", "rating", "avaliação"], "⭐"),
    (["profitable", "tá rendendo", "worth it", "compensa", "dá pra tirar", "earn"], "💵"),
    (["nightly rate", "diária"], "💰"),
    (["condomínio", "monthly building maintenance"], "🏢"),
    (["separately", "por fora", "not included"], "➕"),

    # ── Shopping / market ──
    (["feira livre", "open-air street market", "feirante", "market vendor"], "🧺"),
    (["supermarket", "supermercado", "mercado", "market"], "🛒"),
    (["aisle", "corredor"], "🛒"),
    (["bag", "sacola"], "🛍️"),
    (["cashier", "checkout", "register", "caixa"], "🧾"),
    (["it's going for", "tá saindo por", "lock the price", "trave o preço"], "🏷️"),
    (["delivery", "entrega", "pedido pra entrega", "arrives in", "chega em"], "🛵"),

    # ── Hotel / home / real estate ──
    (["hotel"], "🏨"),
    (["inn", "guesthouse", "pousada"], "🏡"),
    (["reservation", "reserva"], "📅"),
    (["room", "quarto", "bedroom"], "🚪"),
    (["key", "chave"], "🔑"),
    (["gate", "portão"], "🚪"),
    (["lockbox", "cofrezinho", "cofre"], "🔐"),
    (["doorman", "porteiro"], "🛎️"),
    (["basement", "subsolo", "by token", "por ficha"], "🪙"),
    (["quiet hours", "silêncio"], "🤫"),
    (["knock", "bater na porta"], "🚪"),
    (["no problem", "sem problema"], "👌"),
    (["make yourself comfortable", "fica à vontade"], "🛋️"),
    (["make yourself at home", "se sinta em casa"], "🏠"),
    (["moved in", "mudei"], "📦"),

    # ── Greetings / farewells ──
    (["hey, sir", "moço"], "🙋"),
    (["come back anytime", "volte sempre"], "👋"),
    (["good morning", "bom dia"], "🌅"),
    (["good afternoon", "boa tarde"], "🌆"),
    (["good evening", "good night", "boa noite"], "🌙"),
    (["hey", "what's up", "e aí", "oi", "olá", "hello", "alô"], "👋"),
    (["bye", "see you", "tchau", "até", "farewell"], "👋"),

    # ── Thanks & politeness ──
    (["you're welcome", "de nada", "don't mention it", "imagina", "no worries"], "🤝"),
    (["thanks", "obrigado", "obrigada", "valeu", "thank you"], "🙏"),
    (["excuse me", "com licença"], "🙇"),
    (["please", "por favor"], "🙏"),
    (["sir", "senhora", "respectful address"], "🙇"),

    # ── Agreement / confirmation ──
    (["deal", "fechou", "we have a deal", "a gente fecha"], "🤝"),
    (["agreed", "combinado", "it's a plan"], "✅"),
    (["sure thing", "pode deixar", "will do", "sure", "claro"], "👌"),
    (["that works", "serve pra você", "pode ser", "works for you"], "👌"),
    (["alright", "cool", "beleza", "tá bom", "tá ótimo"], "👍"),
    (["let's go", "let's do it", "bora", "vamos"], "🚀"),
    (["trust me", "pode confiar"], "🤝"),
    (["emphatic yes", "sou sim", "yes, i am"], "✅"),
    (["fair", "justo"], "⚖️"),
    (["that's the one", "esse mesmo", "exactly that"], "🎯"),
    (["makes sense", "faz sentido"], "💡"),
    (["least bad", "menos pior"], "⚖️"),
    (["don't promise", "não promete, faz"], "💪"),
    (["get used to", "a gente acostuma"], "🔁"),

    # ── Questions ──
    (["tag question", "né", "right?", "isn't it"], "❓"),
    (["how many", "quantos"], "🔢"),
    (["let me see", "deixa eu ver"], "👀"),
    (["suspicious", "desconfia"], "🤨"),
    (["how about", "que tal"], "💡"),
    (["does it go", "vai pro centro"], "🚏"),

    # ── Time ──
    (["every six hours", "de seis em seis horas"], "⏰"),
    (["for two days", "faz dois dias", "how long", "long weekend", "feriado", "business days", "dias úteis"], "📅"),
    (["just a moment", "só um minutinho", "just five minutes", "cinco minutinhos", "minute", "minuto"], "⏱️"),
    (["it took me", "demorei"], "⏳"),
    (["hectic", "corrido", "busy", "movimentado"], "⏰"),
    (["it's been a while", "faz tempo"], "⏳"),
    (["when it's ready", "quando ficar pronto"], "⏳"),
    (["scheduled appointment", "horário marcado", "schedule", "agendar"], "📅"),
    (["hour", "horas"], "🕐"),

    # ── Idioms / expressions (softer catch) ──
    (["wow", "nossa", "surprise", "surprised", "surprising", "exclamation"], "😮"),
    (["glad you liked it", "que bom que gostou"], "😊"),
    (["something else", "outra coisa"], "✨"),
    (["trust me", "pode confiar"], "🤝"),
    (["all good", "tá tranquilo", "tranquilo", "i'm fine"], "😌"),
    (["if you need anything", "qualquer coisa"], "🆘"),
    (["anytime", "sempre"], "♾️"),

    # ── Work & career ──
    (["hybrid model", "modelo híbrido", "home office", "remote"], "💻"),
    (["hr", "recursos humanos", "rh"], "👔"),
    (["notice period", "aviso prévio", "left on good terms", "saí numa boa"], "👋"),
    (["target", "meta", "above target", "acima da meta"], "🎯"),
    (["raise", "reajuste", "adjustment", "salary floor", "piso"], "📈"),
    (["fight for you", "lutar por você"], "🥊"),
    (["graduated in", "formado em"], "🎓"),
    (["professional maturity", "maturidade profissional", "well under pressure", "sob pressão"], "💼"),
    (["redesigned", "redesenhei"], "🎨"),
    (["deals with", "lida com"], "🛠️"),
    (["took on", "assumi"], "📌"),
    (["didn't keep up", "não acompanhou"], "📉"),
    (["punctuality", "pontualidade"], "⏰"),
    (["reserved (personality)", "reservadas"], "🤐"),
    (["adopts quickly", "accepts you", "adota rápido"], "🤗"),
    (["makes up an excuse", "makes up", "inventa uma desculpa"], "🤥"),
    (["give it a chance", "dar uma chance"], "🎯"),
    (["ash wednesday", "quarta de cinzas"], "🗓️"),
    (["room to grow", "dá pra crescer"], "📈"),
    (["killing myself at work", "me matando no trabalho"], "🥵"),
    (["end up neglecting", "acabo deixando de lado"], "🫥"),
    (["prioritize us", "prioriza a gente"], "💕"),
    (["no way to", "não teve como"], "🚫"),
    (["enjoying", "gostando", "tô gostando"], "😊"),
    (["day off", "folgar"], "🛌"),

    # ── Bureaucracy / legal ──
    (["notarize", "notarized", "notary", "reconhecida", "reconhecer firma", "reconhecimento de firma", "autenticar", "autenticidade", "semelhança", "firma aberta", "cartório", "signature authentication"], "🖋️"),
    (["despachante", "bureaucracy handler"], "📂"),
    (["police report", "boletim de ocorrência", "snatched", "arrancou"], "👮"),
    (["procon", "consumer defense", "código de defesa"], "🛡️"),
    (["sac", "customer service", "authorized service", "assistência técnica"], "🛠️"),
    (["passing the problem", "empurrando o problema"], "🔄"),
    (["durable good", "produto durável"], "📦"),
    (["hands tied", "mãos atadas"], "🙌"),
    (["cpf"], "🆔"),
    (["public hearing", "audiência pública"], "🏛️"),
    (["city council", "vereador", "mayor", "prefeito"], "🏛️"),
    (["hold accountable", "cobra", "complain without", "reclamar sem agir"], "📣"),
    (["get involved", "se envolver"], "🙋"),
    (["nothing concrete", "nada concreto"], "🤷"),
    (["arrange", "providenciar", "speeds things up", "agiliza"], "⚡"),

    # ── Sports / games ──
    (["game", "jogo", "played badly", "jogou muito mal"], "⚽"),
    (["explains it", "tá explicado"], "💡"),
    (["doesn't give up", "não larga"], "🔂"),

    # ── Gym / body ──
    (["gym", "academia"], "🏋️"),
    (["leg press"], "🏋️"),
    (["stop for good", "parar de vez"], "🛑"),
    (["eating properly", "comendo direito"], "🥗"),

    # ── Hair / beauty ──
    (["keratin", "progressiva", "frizzy", "armado", "dry/damaged", "ressecado", "hidratação", "conditioning"], "💇"),

    # ── Family / social ──
    (["mayor", "parents", "family", "família"], "👨‍👩‍👧"),
    (["elderly", "a senhora", "minha senhora"], "👵"),
    (["birthday", "turns thirty", "faz trinta"], "🎂"),
    (["party", "festa"], "🎉"),
    (["everyone", "gente", "guys"], "🙌"),
    (["met each other", "se conheceu"], "🤝"),
    (["friend", "amigo"], "🫂"),
    (["messing around in the garage", "mexendo na garagem"], "🔧"),

    # ── Diminutive / informal markers (only as last-resort fallbacks) ──
    (["diminutive"], "🤏"),
    (["contraction", "contração", "short for"], "✂️"),

    # ── Emphasis / exclamations ──
    (["exactly the same", "igualzinho"], "🎯"),
    (["makes a difference", "faz diferença"], "✨"),
    (["the face of brazil", "a cara do brasil"], "🇧🇷"),
    (["welcome to brazilian summer", "verão brasileiro"], "🇧🇷"),
    (["welcome to brazil", "bem-vindo ao brasil"], "🇧🇷"),
    (["doesn't even hurt", "nem dói"], "😅"),
    (["don't even get me started", "nem me fala"], "🙄"),
    (["came to see", "vim ver"], "👀"),
    (["I'll be waiting", "fico no aguardo"], "⏳"),

    # ── General helpers (last resort, before default) ──
    (["opening", "available slot", "vaga"], "📅"),
    (["can it be fixed", "consertar"], "🔧"),
    (["matches with", "matches", "combina com"], "🎨"),
    (["i was thinking", "tava pensando", "i'm thinking"], "💭"),
    (["inconvenience", "transtorno"], "😔"),
    (["that's a good idea", "é uma boa", "good idea"], "💡"),
    (["cuts in half", "corta pela metade"], "➗"),
    (["we can go", "dá pra ir"], "🚶"),
    (["give me", "me dá"], "🤲"),
    (["bring me", "me traz"], "🤲"),
    (["can't miss it", "não tem como errar"], "🎯"),
    (["under the name of", "no nome de"], "📝"),
    (["should arrive", "deve chegar"], "🕐"),
    (["i'd like to", "eu queria"], "🙏"),
    (["ends up about the same", "sai parecido"], "⚖️"),
    (["in front", "aqui na frente"], "📍"),
    (["taking care of", "quem tá cuidando"], "🛎️"),
    (["put on top", "bota em cima"], "🔝"),
    (["do you have", "tem...?", "tem?"], "🙋"),
    (["i'll take it", "eu levo"], "👍"),
    (["come in", "pode entrar", "go ahead"], "🚪"),
    (["let's hope", "quando acabar", "before it's gone", "antes que acabe", "before it goes up", "antes que aumente"], "⏳"),
    (["go home", "ir embora", "leave", "sair"], "🏠"),
    (["send me", "me manda"], "📨"),
    (["come on", "para, vai"], "💬"),
    (["trust", "confia"], "🤝"),
    (["yes (phone)", "alô"], "📞"),
]

DEFAULT_EMOJI = "💬"


def _has_keyword(haystack: str, kw: str) -> bool:
    """Substring match with word boundaries — a keyword must be bounded
    on both sides by a non-alphanumeric character (or string edge).
    This prevents 'oi' from matching 'dois', 'dor' from 'corredor',
    'love' from 'Brazilians love', 'hot' from 'hotel', etc.
    Works correctly with accented Unicode characters."""
    kw = kw.lower()
    idx = 0
    n = len(haystack)
    klen = len(kw)
    while True:
        pos = haystack.find(kw, idx)
        if pos == -1:
            return False
        before_ok = pos == 0 or not haystack[pos - 1].isalnum()
        end = pos + klen
        after_ok = end == n or not haystack[end].isalnum()
        if before_ok and after_ok:
            return True
        idx = pos + 1


def term_to_emoji(term: str, note: str) -> str:
    haystack = f" {term.lower()} {note.lower()} "
    for keywords, emoji in EMOJI_RULES:
        for kw in keywords:
            if _has_keyword(haystack, kw):
                return emoji
    return DEFAULT_EMOJI


# ── Parser ────────────────────────────────────────────────────────

def parse_dialogues(md: str):
    sections = re.split(r"^### Dialogue ", md, flags=re.MULTILINE)[1:]
    dialogues = []
    for section in sections:
        if section.strip().startswith("Mini-Podcast"):
            continue
        header = re.match(r"^(\d+)\s*—\s*(.+?)\s*\((.+?)\)\s*$", section, re.MULTILINE)
        if not header:
            continue
        num = int(header.group(1))
        title_pt = header.group(2).strip()
        title_en = header.group(3).strip()

        meta = re.search(
            r"\*\*Level:\*\*\s*([^\|]+?)\s*\|\s*\*\*Setting:\*\*\s*([^\|]+?)\s*\|\s*\*\*Theme:\*\*\s*(.+?)$",
            section, re.MULTILINE
        )
        level = meta.group(1).strip() if meta else ""

        vocab = []
        vm = re.search(r"\*\*Vocabulary notes:\*\*\s*\n((?:- .+\n?)+)", section)
        if vm:
            for line in vm.group(1).strip().split("\n"):
                line = line.strip()
                if line.startswith("- "):
                    item = line[2:]
                    m = re.match(r'^"([^"]+)"\s*[—–-]\s*(.+)$', item)
                    if m:
                        vocab.append({"term": m.group(1), "note": m.group(2)})

        dialogues.append({
            "num": num, "title_pt": title_pt, "title_en": title_en,
            "level": level, "vocab": vocab,
        })
    return dialogues


# ── HTML shell ────────────────────────────────────────────────────

HTML_HEAD = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SpeakEasy — Brazilian Listening Lab · Vocabulary Flashcards</title>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
img.emoji {
  height: 1em; width: 1em;
  margin: 0 0.05em 0 0.1em;
  vertical-align: -0.1em; display: inline;
}
body {
  font-family:'Inter',sans-serif; background:#D8D4CC;
  display:flex; flex-direction:column; align-items:center;
  gap:48px; padding:48px 20px;
}
.page-label {
  width:420px; font-family:'Inter',sans-serif; font-size:10px;
  font-weight:600; letter-spacing:0.15em; text-transform:uppercase;
  color:#999; margin-bottom:-36px; padding-left:4px;
}
.page {
  width:420px; background:#F5F0E8; border-radius:16px;
  overflow:hidden; border:1px solid #D4CBBB;
}

/* ── Shared header/body blocks (cover, how-to, closing) ── */
.header {
  background:#1E4D3B; padding:26px 32px 22px;
  position:relative; overflow:hidden;
  display:flex; align-items:flex-start; justify-content:space-between;
}
.header::before {
  content:''; position:absolute; top:-50px; right:-50px;
  width:160px; height:160px; border-radius:50%;
  background:rgba(255,255,255,0.05);
}
.section-tag {
  font-family:'Inter',sans-serif; font-size:10px; font-weight:500;
  letter-spacing:0.15em; text-transform:uppercase; color:#7EC8A4; margin-bottom:5px;
}
.header-title {
  font-family:'Poppins',sans-serif; font-size:19px; font-weight:700;
  color:#fff; line-height:1.15;
}
.header-sub {
  margin-top:5px; font-family:'Inter',sans-serif;
  font-size:10.5px; color:rgba(255,255,255,0.55);
}
.page-num {
  font-family:'Inter',sans-serif; font-size:11px; color:rgba(255,255,255,0.3);
  letter-spacing:0.1em; flex-shrink:0; margin-top:2px;
}
.body { padding:22px 30px 30px; display:flex; flex-direction:column; gap:14px; }
.body.idx-body { gap:0; }
.intro {
  font-size:12px; color:#6B7B6E; line-height:1.6;
  border-left:3px solid #A8E6C3; padding-left:12px; font-style:italic;
}
.tip-box {
  background:#1E4D3B; border-radius:11px; padding:13px 15px;
  display:flex; gap:9px; align-items:flex-start;
}
.tip-icon { font-size:14px; flex-shrink:0; margin-top:1px; }
.tip-label {
  font-family:'Inter',sans-serif; font-size:10px; font-weight:500;
  letter-spacing:0.12em; text-transform:uppercase; color:#7EC8A4; margin-bottom:3px;
}
.tip-text {
  font-family:'Inter',sans-serif; font-size:11.5px;
  color:rgba(255,255,255,0.85); line-height:1.6;
}
.tip-text em { color:#A8E6C3; font-style:normal; font-weight:500; }
.info-box {
  background:#FFF8F0; border:1px solid #F0D4A8; border-radius:10px;
  padding:11px 14px;
}
.info-label {
  font-family:'Inter',sans-serif; font-size:10px; font-weight:600;
  letter-spacing:0.1em; text-transform:uppercase; color:#B07030; margin-bottom:6px;
}
.info-item {
  display:block; font-family:'Inter',sans-serif; font-size:10.5px;
  color:#7A5020; line-height:1.5; padding:3px 0;
  border-top:1px solid rgba(240,212,168,0.4);
}
.info-item:first-child { border-top:none; padding-top:0; }
.info-item strong {
  font-family:'Poppins',sans-serif; color:#5A3818; font-weight:600;
}

/* ── Flashcard deck pages (4 cards each) ── */
.deck-page {
  display:flex; flex-direction:column;
  height:747px;
}
.flashcard {
  flex:1; padding:12px 18px;
  display:grid;
  grid-template-columns:44px 1fr;
  column-gap:12px; row-gap:3px;
  align-content:center;
  position:relative;
}
.flashcard + .flashcard {
  border-top:1px dashed #C8BFB0;
}
.fc-emoji {
  grid-column:1; grid-row:1 / span 3;
  font-size:30px; line-height:1;
  display:flex; align-items:center; justify-content:center;
}
.fc-head {
  grid-column:2; grid-row:1;
  display:flex; align-items:baseline; justify-content:space-between;
  gap:8px;
}
.fc-term {
  font-family:'Poppins',sans-serif; font-size:17px; font-weight:700;
  color:#1E4D3B; line-height:1.2; letter-spacing:-0.2px;
  flex:1; min-width:0;
  overflow:hidden; text-overflow:ellipsis;
  display:-webkit-box; -webkit-line-clamp:1; -webkit-box-orient:vertical;
}
.fc-meta {
  font-family:'Inter',sans-serif; font-size:9px; font-weight:600;
  letter-spacing:0.1em; text-transform:uppercase;
  color:#8FA897; flex-shrink:0;
  display:flex; gap:6px; align-items:center;
}
.fc-meta .lvl {
  background:#FFF8F0; border:1px solid #F0D4A8; color:#B07030;
  padding:1px 6px; border-radius:8px;
}
.fc-meaning {
  grid-column:2; grid-row:2;
  font-family:'Inter',sans-serif; font-size:11.5px; color:#3D5247;
  line-height:1.45;
  overflow:hidden; text-overflow:ellipsis;
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;
}
.fc-source {
  grid-column:2; grid-row:3;
  font-family:'Inter',sans-serif; font-size:9.5px; color:#5A9BA4;
  letter-spacing:0.02em; margin-top:2px;
}
.fc-source strong {
  font-family:'Poppins',sans-serif; font-weight:600; color:#2D6B52;
}

/* ── Index ── */
.idx-row {
  display:flex; align-items:baseline; padding:2px 0;
  border-bottom:1px solid rgba(212,203,187,0.4);
  gap:6px; line-height:1.35;
}
.idx-row:last-child { border-bottom:none; }
.idx-num {
  font-family:'Poppins',sans-serif; font-size:9px; font-weight:700;
  color:#7EC8A4; min-width:24px;
}
.idx-term {
  font-family:'Poppins',sans-serif; font-size:10.5px; font-weight:500;
  color:#1E4D3B;
  overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
  flex:1; min-width:0;
}
.idx-dots {
  border-bottom:1px dotted #C8BFB0; min-width:8px; margin-bottom:3px; flex-shrink:0; width:14px;
}
.idx-page {
  font-family:'Inter',sans-serif; font-size:9.5px; font-weight:500;
  color:#8FA897; min-width:18px; text-align:right;
}

@media print {
  *, *::before, *::after {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  @page { size: 420px auto; margin: 0mm; }
  html, body {
    width: 420px !important; margin: 0 !important; padding: 0 !important;
    background: #F5F0E8 !important; display: block !important;
  }
  .page-label { display: none !important; }
  .page {
    width: 420px !important; border-radius: 0 !important;
    border: none !important; overflow: hidden !important;
    page-break-after: always; page-break-inside: avoid;
    margin: 0 !important;
  }
  .page:last-of-type { page-break-after: auto; }
  .flashcard { page-break-inside: avoid; }
}
</style>
</head>
<body>
"""

HTML_TAIL = """
<script src="https://cdn.jsdelivr.net/npm/@twemoji/api@latest/dist/twemoji.min.js" crossorigin="anonymous"></script>
<script>
  twemoji.parse(document.body, {
    base: 'https://cdn.jsdelivr.net/gh/iamcal/emoji-data@master/',
    folder: 'img-apple-160',
    ext: '.png'
  });
</script>
</body>
</html>
"""


def render_cover(total_cards: int) -> str:
    return f"""
<div class="page-label">📄 PAGE 01 — Cover</div>
<div class="page" style="height:747px; background:linear-gradient(to bottom, #E8E5DC 0, #E8E5DC 703px, #1E4D3B 703px, #1E4D3B 100%); background-color:#1E4D3B; position:relative; overflow:hidden; border:none;">
  <div style="position:absolute; left:0; top:0; width:100%; height:72px; overflow:hidden; z-index:5;">
    <div style="position:absolute;top:-40px;right:-40px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,0.05);"></div>
    <div style="position:absolute; left:50%; top:45%; transform:translate(-50%, -50%); width:210px; height:85px; overflow:hidden; z-index:10; pointer-events:none;">
      <img src="../_shared/assets/Logo.svg" alt="SpeakEasy Portuguese" style="position:absolute; left:-1px; top:-1px; width:calc(100% + 2px); height:calc(100% + 2px); display:block; object-fit:cover; object-position:center;" />
    </div>
  </div>
  <div style="position:absolute; left:0; bottom:0; width:100%; height:44px; background:#1E4D3B; display:flex; align-items:center; justify-content:center; gap:10px; z-index:6;">
    <a href="https://www.instagram.com/speakeasy.ptbr" target="_blank" style="font-family:'Inter',sans-serif; font-size:10px; letter-spacing:0.12em; text-transform:uppercase; color:rgba(255,255,255,0.45); text-decoration:none;">@speakeasy.ptbr</a>
    <div style="width:3px;height:3px;border-radius:50%;background:#7EC8A4;"></div>
    <a href="https://speakeasyptbr.com" target="_blank" style="font-family:'Inter',sans-serif; font-size:10px; font-weight:600; letter-spacing:0.12em; text-transform:uppercase; color:#7EC8A4; text-decoration:none;">speakeasyptbr.com</a>
  </div>
  <div style="position:absolute; left:90px; top:35px; width:239px; height:228px; overflow:hidden; z-index:2; pointer-events:none;">
    <img src="../_shared/assets/Cristo.svg" alt="Cristo Redentor" style="position:absolute; left:-1px; top:-1px; width:calc(100% + 2px); height:calc(100% + 2px); display:block; object-fit:cover; object-position:center;" />
  </div>
  <div style="position:absolute; left:0; right:0; top:275px; padding:0 24px; text-align:center; z-index:3;">
    <div style="font-family:'Poppins',sans-serif; font-size:38px; font-weight:800; color:#1E4D3B; line-height:0.95; letter-spacing:-1px; text-transform:uppercase; margin-bottom:10px;">Vocabulary<br>Flashcards</div>
    <div style="font-family:'Inter',sans-serif; font-size:12px; font-weight:500; letter-spacing:0.22em; text-transform:uppercase; color:#2D6B52; margin-bottom:14px;">Brazilian Listening Lab</div>
    <div style="width:44px; height:3px; background:#A8E6C3; border-radius:2px; margin:0 auto 13px;"></div>
    <div style="font-family:'Poppins',sans-serif; font-size:11px; font-weight:600; color:#1E4D3B; margin-bottom:5px;">{total_cards} CARDS · 50 DIALOGUES</div>
    <div style="font-family:'Inter',sans-serif; font-size:11px; color:#4A6B58;">cut · fold · review · repeat</div>
  </div>
  <div style="position:absolute; left:270px; top:425px; width:232px; height:299px; overflow:hidden; z-index:1; pointer-events:none;">
    <img src="../_shared/assets/Arara.svg" alt="Arara" style="position:absolute; left:-1px; top:-1px; width:calc(100% + 2px); height:calc(100% + 2px); display:block; object-fit:cover; object-position:center;" />
  </div>
  <div style="position:absolute; left:-20px; top:560px; width:238.5px; height:157.2px; overflow:hidden; opacity:0.6; z-index:1; pointer-events:none;">
    <img src="../_shared/assets/Palacio.svg" alt="Palácio" style="position:absolute; left:-1px; top:-1px; width:calc(100% + 2px); height:calc(100% + 2px); display:block; object-fit:cover; object-position:center;" />
  </div>
</div>
"""


def render_how_to(total_cards: int) -> str:
    return f"""
<div class="page-label">📄 PAGE 02 — How to use</div>
<div class="page">
  <div class="header">
    <div>
      <div class="section-tag">How to use</div>
      <h1 class="header-title">Cut. Flip. Remember.</h1>
      <p class='header-sub'>The flashcard method</p>
    </div>
    <div class="page-num">02</div>
  </div>
  <div class="body">
    <p class="intro">Each page holds four cards. The dashed lines are cut guides — or fold lines, if you prefer to keep the book intact.</p>

    <div class="tip-box">
      <div class="tip-icon">✂️</div>
      <div>
        <div class="tip-label">Three ways to use</div>
        <div class="tip-text">
          <strong>Print &amp; cut</strong> — print the PDF, cut along dashed lines, carry a deck of {total_cards} physical cards.<br><br>
          <strong>Screen swipe</strong> — read on your phone. Cover the meaning with your thumb to self-test from the Portuguese term.<br><br>
          <strong>Mix &amp; review</strong> — shuffle cards, keep tricky ones in a "review again" pile, retire the ones you own.
        </div>
      </div>
    </div>

    <div class="info-box">
      <div class="info-label">📚 What's on each card</div>
      <div class="info-item"><strong>Emoji</strong> — a visual hook tied to the meaning, not the dialogue setting.</div>
      <div class="info-item"><strong>Term</strong> — the Portuguese word or expression.</div>
      <div class="info-item"><strong>Meaning</strong> — the English translation or explanation.</div>
      <div class="info-item"><strong>Source</strong> — the dialogue where it appeared, so you can re-listen in context.</div>
    </div>

    <div class="tip-box" style="background:#EEF3F4;">
      <div class="tip-icon">🧠</div>
      <div>
        <div class="tip-label" style="color:#4A838A;">Spaced repetition</div>
        <div class="tip-text" style="color:#3D5E63;">
          Review a card, test yourself again <em>one day later</em>, <em>three days later</em>, and <em>a week later</em>. Memory loves spacing, not cramming.
        </div>
      </div>
    </div>
  </div>
</div>
"""


def render_card(card: dict, idx: int, total: int) -> str:
    emoji = card["emoji"]
    term = card["term"]
    note = card["note"]
    level = card["level"]
    src = f"D{card['dialogue_num']:02d} · {card['dialogue_title']}"
    return f"""    <div class="flashcard">
      <div class="fc-emoji">{emoji}</div>
      <div class="fc-head">
        <div class="fc-term">{term}</div>
        <div class="fc-meta"><span>{idx:03d}/{total:03d}</span><span class="lvl">{level}</span></div>
      </div>
      <div class="fc-meaning">{note}</div>
      <div class="fc-source">📍 <strong>{src}</strong></div>
    </div>
"""


def render_deck_page(cards_in_page, page_num: int) -> str:
    cards_html = "".join(cards_in_page)
    return f"""
<div class="page-label">📄 PAGE {page_num:02d} — Flashcards</div>
<div class="page deck-page">
{cards_html}</div>
"""


def render_index(cards, start_page: int) -> list[str]:
    sorted_cards = sorted(cards, key=lambda c: c["term"].lower())
    rows_per_page = 24
    chunks = [sorted_cards[i:i+rows_per_page] for i in range(0, len(sorted_cards), rows_per_page)]
    html_pages = []
    for i, chunk in enumerate(chunks):
        page_num = start_page + i
        rows = "\n".join([
            f'''<div class="idx-row">
      <div class="idx-num">{c["card_index"]:03d}</div>
      <div class="idx-term">{c["term"]}</div>
      <div class="idx-dots"></div>
      <div class="idx-page">{c["page_num"]}</div>
    </div>'''
            for c in chunk
        ])
        suffix = f" ({i+1}/{len(chunks)})" if len(chunks) > 1 else ""
        html_pages.append(f"""
<div class="page-label">📄 PAGE {page_num:02d} — Index{suffix}</div>
<div class="page">
  <div class="header">
    <div>
      <div class="section-tag">Alphabetical index</div>
      <h1 class="header-title">Find a card</h1>
      <p class='header-sub'>{len(cards)} terms, A to Z{suffix}</p>
    </div>
    <div class="page-num">{page_num:02d}</div>
  </div>
  <div class="body idx-body">
    {rows}
  </div>
</div>
""")
    return html_pages


def render_closing(page_num: int) -> str:
    return f"""
<div class="page-label">📄 PAGE {page_num:02d} — Closing</div>
<div class="page">
  <div class="header">
    <div>
      <div class="section-tag">Keep going</div>
      <h1 class="header-title">Words stick<br>with use</h1>
      <p class='header-sub'>The review that matters</p>
    </div>
    <div class="page-num">{page_num:02d}</div>
  </div>
  <div class="body">
    <p class="intro">A flashcard works only if you come back to it. Don't review every card every day — review the ones you got wrong, let the easy ones rest.</p>
    <div class="tip-box">
      <div class="tip-icon">🌱</div>
      <div>
        <div class="tip-label">Pair these cards with</div>
        <div class="tip-text">
          <strong>The transcripts PDF</strong> — re-listen to the dialogue each term appeared in.<br><br>
          <strong>The workbook</strong> — the fill-the-gap exercises cement active recall.<br><br>
          <em>Passive recognition isn't fluency. Production is.</em>
        </div>
      </div>
    </div>
  </div>
</div>
"""


# ── Build ──

CARDS_PER_PAGE = 4


def build(dialogues):
    all_cards = []
    for d in dialogues:
        for v in d["vocab"]:
            all_cards.append({
                "term": v["term"],
                "note": v["note"],
                "emoji": term_to_emoji(v["term"], v["note"]),
                "level": d["level"],
                "dialogue_num": d["num"],
                "dialogue_title": d["title_pt"],
            })

    total = len(all_cards)
    if total == 0:
        print("   ⚠️  no cards")
        return

    parts = [HTML_HEAD, render_cover(total), render_how_to(total)]

    first_card_page = 3
    card_pages_html = []
    for page_idx in range(0, total, CARDS_PER_PAGE):
        page_num = first_card_page + (page_idx // CARDS_PER_PAGE)
        cards_in_page = []
        for i in range(CARDS_PER_PAGE):
            if page_idx + i >= total:
                break
            c = all_cards[page_idx + i]
            c["card_index"] = page_idx + i + 1
            c["page_num"] = page_num
            cards_in_page.append(render_card(c, c["card_index"], total))
        card_pages_html.append(render_deck_page(cards_in_page, page_num))

    parts.extend(card_pages_html)

    last_card_page = first_card_page + (total + CARDS_PER_PAGE - 1) // CARDS_PER_PAGE - 1
    index_start = last_card_page + 1
    index_pages = render_index(all_cards, index_start)
    parts.extend(index_pages)

    closing_page = index_start + len(index_pages)
    parts.append(render_closing(closing_page))
    parts.append(HTML_TAIL)

    out = OUTPUT_DIR / "speakeasy_flashcards.html"
    out.write_text("".join(parts), encoding="utf-8")
    print(f"   ✅ {out.name}: {total} cards across {closing_page} pages "
          f"({(total + CARDS_PER_PAGE - 1) // CARDS_PER_PAGE} card pages)")


def emoji_audit(dialogues):
    """Print emoji mapping for manual review."""
    print("\n🔎 Emoji mapping audit:\n")
    for d in dialogues:
        for v in d["vocab"]:
            e = term_to_emoji(v["term"], v["note"])
            print(f"  {e}  {v['term']:<40}  — {v['note'][:60]}")


def main():
    md = DIALOGUES_MD.read_text(encoding="utf-8")
    dialogues = parse_dialogues(md)
    print(f"📚 Parsed {len(dialogues)} dialogues\n")

    print("💳 Building Brazilian Listening Lab Vocabulary Flashcards:")
    build(dialogues)

    import sys
    if "--audit" in sys.argv:
        emoji_audit(dialogues)

    print("\n✅ Done. Convert with pdf-generator.")


if __name__ == "__main__":
    main()
