import React from 'react';
import { observer } from 'mobx-react-lite';
import { InputGroup, Button, Spinner } from '@blueprintjs/core';
import { isAlive } from 'mobx-state-tree';
import FaVectorSquare from '@meronex/icons/fa/FaVectorSquare';
import { SectionTab, ImagesGrid } from 'polotno/side-panel';
import { svgToURL } from 'polotno/utils/svg';
import { getKey } from 'polotno/utils/validate-key';
import { getImageSize } from 'polotno/utils/image';
import { t } from 'polotno/utils/l10n';
import { useInfiniteAPI } from 'polotno/utils/use-api';
import { getAPI } from 'polotno/utils/api';

const iconToSrc = async (id) => {
  const req = await fetch(
    `${getAPI()}/download-nounproject?id=${id}&KEY=${getKey()}`
  );
  const text = await req.text();
  const base64 = await svgToURL(text);
  return base64;
};

const limit = 50;

export const NounprojectPanel = observer(({ store, query }) => {
  const { data, isLoading, loadMore, setQuery, hasMore, error } = useInfiniteAPI({
    defaultQuery: query,
    getAPI: ({ page, query }) =>
      `${getAPI()}/get-nounproject?query=${query}&page=${page}&limit=${limit}&KEY=${getKey()}`,
    getSize: (res) => res.pagesNumber,
  });

  React.useEffect(() => {
    setQuery(query);
  }, [query, setQuery]);

  if (error) {
    return <div className="icon-section-error">{t('sidePanel.error')}</div>;
  }

  if (isLoading && !data?.length) {
    return (
      <div className="icon-section-loading">
        <Spinner size={30} />
      </div>
    );
  }

  return (
    <div className="icon-section-noun-container">
      <ImagesGrid
        shadowEnabled={false}
        images={data?.map((data) => data.icons).flat()}
        getPreview={(item) => item.preview_url_84}
        isLoading={isLoading}
        onSelect={async (item, pos, element) => {
          try {
            if (element && element.type === 'image' && !element.locked) {
              const src = await iconToSrc(item.id);
              element.set({ clipSrc: src });
              return;
            }
            const width = 200;
            const height = 200;
            store.history.transaction(async () => {
              const x = (pos?.x || store.width / 2) - width / 2;
              const y = (pos?.y || store.height / 2) - height / 2;
              const svg = store.activePage?.addElement({
                type: 'svg',
                width,
                height,
                x,
                y,
              });
              const src = await iconToSrc(item.id);
              if (isAlive(svg)) {
                await svg.set({ src });
              }
            });
          } catch (err) {
            console.error('Error adding icon:', err);
          }
        }}
        rowsNumber={4}
        loadMore={hasMore && loadMore}
        noResultsMessage={t('sidePanel.noResults')}
        loadMoreMessage={t('sidePanel.loadMore')}
      />
    </div>
  );
});

export const IconFinderPanel = observer(({ store, query }) => {
  const count = 50;
  const { data, isLoading, loadMore, setQuery, error, hasMore } = useInfiniteAPI({
    getAPI: ({ page, query }) =>
      `${getAPI()}/get-iconfinder?query=${query}&offset=${(page - 1) * count}&count=${count}&KEY=${getKey()}`,
    getSize: (res) => Math.ceil(res.total_count / count),
  });

  React.useEffect(() => {
    setQuery(query);
  }, [query, setQuery]);

  if (error) {
    return <div className="icon-section-error">{t('sidePanel.error')}</div>;
  }

  if (isLoading && !data?.length) {
    return (
      <div className="icon-section-loading">
        <Spinner size={30} />
      </div>
    );
  }

  return (
    <ImagesGrid
      shadowEnabled={false}
      images={data?.map((data) => data.icons).flat()}
      getPreview={(item) => item.raster_sizes[6].formats[0].preview_url}
      isLoading={isLoading}
      onSelect={async (item, pos, element) => {
        try {
          const { download_url } = item.vector_sizes[0].formats[0];
          if (element && element.type === 'image' && !element.locked) {
            const req = await fetch(
              `${getAPI()}/download-iconfinder?download_url=${download_url}&KEY=${getKey()}`
            );
            const json = await req.json();
            const base64 = await svgToURL(json.content);
            element.set({ clipSrc: base64 });
            return;
          }
          const width = item.vector_sizes[0].size_width;
          const height = item.vector_sizes[0].size_height;
          store.history.transaction(async () => {
            const x = (pos?.x || store.width / 2) - width / 2;
            const y = (pos?.y || store.height / 2) - height / 2;
            const svg = store.activePage?.addElement({
              type: 'svg',
              width,
              height,
              x,
              y,
            });
            const req = await fetch(
              `${getAPI()}/download-iconfinder?download_url=${download_url}&KEY=${getKey()}`
            );
            const json = await req.json();
            const base64 = await svgToURL(json.content);
            if (isAlive(svg)) {
              await svg.set({ src: base64 });
            }
          });
        } catch (err) {
          console.error('Error adding icon:', err);
        }
      }}
      rowsNumber={4}
      error={error}
      loadMore={hasMore && loadMore}
      noResultsMessage={t('sidePanel.noResults')}
      loadMoreMessage={t('sidePanel.loadMore')}
    />
  );
});

export const IconsPanel = observer(({ store }) => {
  const requestTimeout = React.useRef();
  const [query, setQuery] = React.useState('');
  const [delayedQuery, setDelayedQuery] = React.useState(query);
  const [service, setService] = React.useState('iconfinder');

  React.useEffect(() => {
    requestTimeout.current = setTimeout(() => {
      setDelayedQuery(query);
    }, 500);
    return () => {
      clearTimeout(requestTimeout.current);
    };
  }, [query]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <InputGroup
        leftIcon="search"
        placeholder={t('sidePanel.searchPlaceholder')}
        onChange={(e) => setQuery(e.target.value)}
        type="search"
        style={{ marginBottom: '20px' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px' }}>
        <Button
          onClick={() => setService('iconfinder')}
          active={service === 'iconfinder'}
          icon={<img src="/iconfinder.svg" alt={t('sidePanel.iconfinder')} width="15" />}
        >
          {t('sidePanel.iconfinder')}
        </Button>
        <Button
          onClick={() => setService('nounproject')}
          active={service === 'nounproject'}
          icon={<img src="/noun-project.svg" alt={t('sidePanel.nounproject')} width="15" />}
        >
          {t('sidePanel.nounproject')}
        </Button>
      </div>
      {service === 'nounproject' && (
        <NounprojectPanel query={delayedQuery} store={store} />
      )}
      {service === 'iconfinder' && (
        <IconFinderPanel query={delayedQuery} store={store} />
      )}
    </div>
  );
});

export const IconsSection = {
  name: 'icons',
  Tab: observer((props) => (
    <SectionTab name={t('sidePanel.icons')} {...props}>
      <FaVectorSquare />
    </SectionTab>
  )),
  Panel: IconsPanel,
};
