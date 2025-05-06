import { useContext, useState } from "react";

import { ModPicker, ModListItem } from "~/components";
import { NotFound } from "./NotFound.tsx";
import { DataContext } from "~/context";

import List from "@mui/material/List";
import Container from "@mui/material/Container";

import type { Modpack } from "~/data";

//================================================

type ModpackDetailPageContentProps = {
  pack: Modpack;
};

function ModpackDetailPageContent({ pack }: ModpackDetailPageContentProps) {
  const { updatePack } = useContext(DataContext);

  const [modList, setModList] = useState(() => pack.mods.map(mod => mod.meta));

  return (
    <Container maxWidth="lg" sx={{ paddingBlock: "3rem" }}>
      <ModPicker
        size="small"
        value={modList}
        onChange={(_, newValue) => setModList(newValue)}
      />
      <List>
        {modList.map(item => (
          <ModListItem
            key={item.slug}
            mod={item}
            showPlatforms
            onRemove={mod =>
              setModList(list => list.filter(m => m.slug !== mod.slug))
            }
          />
        ))}
      </List>
    </Container>
  );
}

export function ModpackDetailPage() {
  const { currentPack } = useContext(DataContext);
  if (!currentPack) {
    return <NotFound />;
  }

  return <ModpackDetailPageContent pack={currentPack} />;
}
