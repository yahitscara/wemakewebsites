"""Builds case/<slug>.html from tools/case_template.html.
Edit the CASES text below, then run from the project root:  python tools/make_cases.py
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

CASES = [
    dict(
        slug="nick-daulton", media="nickdaulton", name="Nick Daulton",
        url="https://nickdaultoncomics.com", host="nickdaultoncomics.com",
        lede="A comic artist’s site that reads like his comic: you scroll, the panels arrive, and at the end you can buy the book.",
        facts=[("Client", "Nick Daulton, comic artist"), ("Built", "Scroll-told story, shop, contact"),
               ("Year", "2026"), ("Stack", "Static site, Big Cartel checkout")],
        problem=["Nick had two finished books and an Instagram account. There was nowhere to send a reader who wanted a physical copy, and nothing that showed the work at full size.",
                 "[Placeholder: what Nick said he wanted, in his words.]"],
        built=["Book one’s opening told as a scroll: real panels cut from his pages, arriving in order.",
               ["A shop section that hands checkout to Big Cartel, so there is no store to maintain",
                "Bio, self-portraits and a contact form for commissions",
                "Phone-first: the story works with a thumb"]],
        changed=["[Placeholder: launch date, first orders, what readers said, anything measurable.]",
                 "[Placeholder: one line from Nick.]"],
        next=("workwonder", "Workwonder"),
    ),
    dict(
        slug="workwonder", media="workwonder", name="Workwonder",
        url="https://workwonder.art", host="workwonder.art",
        lede="A gallery for a Dubai-based painter: ten canvases, one at a time, each with its own page and a way to ask about it.",
        facts=[("Client", "Maryna Klymchuk, painter"), ("Built", "Gallery, exhibitions, enquiries"),
               ("Year", "2026"), ("Stack", "Static site, hand-built")],
        problem=["Maryna came to painting after a decade as a concept artist and creative director. The paintings needed a home that felt like a quiet room, not a feed.",
                 "[Placeholder: what she wanted collectors to feel, in her words.]"],
        built=["Each painting arrives out of the dark as you scroll, with its title, size and medium, and an enquiry link.",
               ["Ten paintings, each with its own page",
                "Exhibitions and an About page in her own words",
                "Enquiries go straight to her inbox"]],
        changed=["[Placeholder: launch date, enquiries, exhibitions since, anything measurable.]",
                 "[Placeholder: one line from Maryna.]"],
        next=("nick-daulton", "Nick Daulton"),
    ),
]


def blocks(items):
    out = []
    for it in items:
        if isinstance(it, list):
            out.append("<ul>" + "".join(f"<li>{x}</li>" for x in it) + "</ul>")
        else:
            out.append(f"<p>{it}</p>")
    return "\n      ".join(out)


template = (ROOT / "tools" / "case_template.html").read_text(encoding="utf-8")
(ROOT / "case").mkdir(exist_ok=True)
for c in CASES:
    facts = "\n".join(f"      <div><dt>{k}</dt><dd>{v}</dd></div>" for k, v in c["facts"])
    values = dict(slug=c["slug"], media=c["media"], name=c["name"], url=c["url"], host=c["host"],
                  lede=c["lede"], facts=facts, problem=blocks(c["problem"]), built=blocks(c["built"]),
                  changed=blocks(c["changed"]), next_slug=c["next"][0], next_name=c["next"][1])
    html = template
    for k, v in values.items():
        html = html.replace("{{" + k + "}}", v)
    (ROOT / "case" / f"{c['slug']}.html").write_text(html, encoding="utf-8")
    print(f"wrote case/{c['slug']}.html")
