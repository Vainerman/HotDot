#!/usr/bin/env python3
"""
convert_shapes_to_paths.py

Converts basic SVG shapes (rect, circle, ellipse, line, polyline, polygon)
to <path> elements without altering their visual appearance.

Usage:
    pip install lxml
    # Single file:
    python convert_shapes_to_paths.py input.svg
    # Entire folder (all .svg in it will be overwritten):
    python convert_shapes_to_paths.py path/to/svg_folder
"""

import sys
import os
from lxml import etree

SVG_NS = "http://www.w3.org/2000/svg"
NSMAP = {None: SVG_NS}

def shape_to_path(elem):
    tag = etree.QName(elem).localname
    def copy_attrs(new):
        for k, v in elem.items():
            if k not in shape_specific:
                new.set(k, v)

    shape_specific = []
    d = ""

    if tag == "rect":
        x = float(elem.get("x", 0))
        y = float(elem.get("y", 0))
        w = float(elem.get("width", 0))
        h = float(elem.get("height", 0))
        d = f"M{x},{y} H{x + w} V{y + h} H{x} Z"
        shape_specific = ["x", "y", "width", "height", "rx", "ry"]

    elif tag == "circle":
        cx = float(elem.get("cx", 0))
        cy = float(elem.get("cy", 0))
        r  = float(elem.get("r", 0))
        d = (
            f"M{cx + r},{cy} "
            f"A{r},{r} 0 1,0 {cx - r},{cy} "
            f"A{r},{r} 0 1,0 {cx + r},{cy}"
        )
        shape_specific = ["cx", "cy", "r"]

    elif tag == "ellipse":
        cx = float(elem.get("cx", 0))
        cy = float(elem.get("cy", 0))
        rx = float(elem.get("rx", 0))
        ry = float(elem.get("ry", 0))
        d = (
            f"M{cx + rx},{cy} "
            f"A{rx},{ry} 0 1,0 {cx - rx},{cy} "
            f"A{rx},{ry} 0 1,0 {cx + rx},{cy}"
        )
        shape_specific = ["cx", "cy", "rx", "ry"]

    elif tag == "line":
        x1 = float(elem.get("x1", 0))
        y1 = float(elem.get("y1", 0))
        x2 = float(elem.get("x2", 0))
        y2 = float(elem.get("y2", 0))
        d = f"M{x1},{y1} L{x2},{y2}"
        shape_specific = ["x1", "y1", "x2", "y2"]

    elif tag in ("polyline", "polygon"):
        pts = elem.get("points", "").replace(",", " ").split()
        coords = [float(c) for c in pts]
        pairs = list(zip(coords[::2], coords[1::2]))
        if not pairs:
            return None
        d = "M" + " L".join(f"{x},{y}" for x, y in pairs)
        if tag == "polygon":
            d += " Z"
        shape_specific = ["points"]

    else:
        return None

    new = etree.Element(f"{{{SVG_NS}}}path", nsmap=NSMAP)
    new.set("d", d)
    copy_attrs(new)
    return new

def convert_shapes(input_svg, output_svg):
    parser = etree.XMLParser(remove_blank_text=True)
    tree = etree.parse(input_svg, parser)
    root = tree.getroot()

    for shape in ("rect", "circle", "ellipse", "line", "polyline", "polygon"):
        for elem in root.findall(f".//{{{SVG_NS}}}{shape}"):
            path = shape_to_path(elem)
            if path is not None:
                parent = elem.getparent()
                idx = parent.index(elem)
                parent.remove(elem)
                parent.insert(idx, path)

    tree.write(
        output_svg,
        pretty_print=True,
        xml_declaration=True,
        encoding="utf-8"
    )

def main(target):
    if os.path.isdir(target):
        svgs = [f for f in os.listdir(target) if f.lower().endswith(".svg")]
        if not svgs:
            print(f"No .svg files found in directory: {target}")
            return
        for fname in svgs:
            path = os.path.join(target, fname)
            print(f"Processing {path}…")
            convert_shapes(path, path)
        print("Done.")
    elif os.path.isfile(target) and target.lower().endswith(".svg"):
        convert_shapes(target, target)
        print(f"Rewritten {target}")
    else:
        print("Error: target must be an .svg file or a directory containing .svg files.")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python convert_shapes_to_paths.py <input.svg|svg_folder>")
        sys.exit(1)
    main(sys.argv[1])
