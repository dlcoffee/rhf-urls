'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { useQuery, QueryClient, QueryClientProvider } from 'react-query'

type FormData = {
  query: string
  variant: 'default' | 'shiny'
}

/**
 *  const { onChange, onBlur, name, ref } = register('firstName');
 *  // include type check against field path with the name you have supplied.
 *
 *  <input
 *    onChange={onChange} // assign onChange event
 *    onBlur={onBlur} // assign onBlur event
 *    name={name} // assign name prop
 *    ref={ref} // assign ref prop
 *  />
 *  // same as above
 *  <input {...register('firstName')} />
 **/

async function search(idOrName: string) {
  try {
    return (await fetch(`https://pokeapi.co/api/v2/pokemon/${idOrName}`)).json()
  } catch (err) {
    return null
  }
}

const queryClient = new QueryClient()

interface Sprite {
  url: string
  alt: string
}

function Sprite({ url, alt }: Sprite) {
  return <Image src={url} alt={alt} width={96} height={96} />
}

function Content() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  // NOTE: If an application includes the /pages directory, useSearchParams
  // will return ReadonlyURLSearchParams | null. The null value is for
  // compatibility during migration since search params cannot be known during
  // pre-rendering of a page that doesn't use getServerSideProps
  const queryString = searchParams ? searchParams.get('query') || '' : ''
  const variantString = searchParams ? searchParams.get('variant') || '' : ''
  console.log('render:', variantString)

  const {
    formState: { errors, isDirty, isSubmitting, touchedFields, submitCount },
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
  } = useForm<FormData>({
    mode: 'all',
    defaultValues: {
      query: queryString,
      variant: ['shiny', 'default'].includes(variantString)
        ? (variantString as 'shiny' | 'default') // this is dumb i know.
        : 'default',
    },
  })

  const watchAllFields = watch()

  const { isLoading, isFetching, data } = useQuery(
    ['search', queryString],
    () => search(queryString),
    {
      retry: false,
      enabled: Boolean(queryString),
      refetchOnWindowFocus: false,
    }
  )

  useEffect(() => {
    console.log('pathname OR searchparams changed', {
      pathname,
      searchParams,
    })

    // searchParams have changed from route, so sync up the form.
    // this solves for browser navigation.
    // Issue: `reset` clears form submission count.
    // reset({
    //   query: searchParams.get('query') || '',
    // })

    // OR

    // actually, do i really want to keep track of things like
    // "submit count" when navigating forward/backwards
    // in the browser?
    setValue('query', searchParams ? searchParams.get('query') || '' : '')
    const variantParam = searchParams ? searchParams.get('variant') : ''
    console.log('ok wtf', variantParam)
    switch (variantParam) {
      case 'shiny': {
        console.log('set value to shiny')
        setValue('variant', 'shiny')
      }
      case 'default':
      default: {
        setValue('variant', 'default')
      }
    }
  }, [pathname, searchParams, reset, setValue])

  const onSubmit = handleSubmit((data) => {
    const qs = [
      ['query', data.query],
      ['variant', data.variant],
    ]
      .filter((tuple) => Boolean(tuple[1]))
      .map((tuple) => {
        return `${tuple[0]}=${tuple[1]}`
      })
      .join('&')

    const href = qs.length > 0 ? `/?${qs}` : '/'
    router.push(href)
  })

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
      }}
    >
      <div
        style={{
          flex: 1,
        }}
      >
        {session && session.user ? (
          <>
            <div>
              <span style={{ paddingRight: 5 }}>
                Signed in as {session.user.email}
              </span>
              <button onClick={() => signOut({ callbackUrl: '/' })}>
                Sign out
              </button>
            </div>

            <form onSubmit={onSubmit}>
              <div>
                <label htmlFor="variant-select">Sprite Variant: </label>

                <select
                  id="variant-select"
                  {...register('variant', {
                    onChange: (e) => {
                      setValue('variant', e.target.value)
                      onSubmit()
                    },
                  })}
                >
                  <option value="default">Default</option>
                  <option value="shiny">Shiny</option>
                </select>
              </div>

              <div>
                <label htmlFor="query">Query: </label>

                <input
                  placeholder="id or name"
                  id="query"
                  {...register('query')}
                />

                <input type="submit" value="Search" />
              </div>
            </form>
            {isLoading ? (
              <h2>Loading:</h2>
            ) : isFetching ? (
              <h2>Fetching:</h2>
            ) : (
              <div>
                <h2>Result:</h2>
                {data ? (
                  <Sprite
                    url={
                      data.sprites[
                        watchAllFields.variant === 'default'
                          ? 'front_default'
                          : 'front_shiny'
                      ]
                    }
                    alt={queryString}
                  />
                ) : (
                  'Not found'
                )}
              </div>
            )}
          </>
        ) : (
          <>
            Not signed in <br />
            <button onClick={() => signIn()}>Sign in</button>
          </>
        )}
      </div>

      <div
        style={{
          padding: 8,
          border: '1px solid black',
          flex: 1,
        }}
      >
        Form State
        <pre>
          {JSON.stringify(
            {
              // errors,
              isDirty,
              isSubmitting,
              touchedFields,
              submitCount,
            },
            null,
            2
          )}
        </pre>
        Watched Fields
        <pre>{JSON.stringify(watchAllFields, null, 2)}</pre>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <main>
        <Content />
      </main>
    </QueryClientProvider>
  )
}
