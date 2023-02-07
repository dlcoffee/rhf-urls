'use client'

// import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useForm } from 'react-hook-form'
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from 'react-query'

type FormData = {
  query: string
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

// let renderCount = 0

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
  return <img src={url} alt={alt} />
}

function Content() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const queryString = searchParams.get('query') || ''

  const { isFetching, isError, data, error } = useQuery(
    ['search', queryString],
    () => search(queryString),
    {
      retry: false,
      enabled: Boolean(queryString),
      refetchOnWindowFocus: false,
    }
  )

  const {
    formState: { errors, isDirty, isSubmitting, touchedFields, submitCount },
    register,
    handleSubmit,
    watch,
    reset,
  } = useForm<FormData>({
    defaultValues: {
      query: queryString,
    },
  })

  const watchAllFields = watch()

  // console.count()

  useEffect(() => {
    console.log('pathname OR searchparams changed', {
      pathname,
      searchParams,
    })

    // searchParams have changed from route, so sync up the form.
    // this solves for browser navigation.
    // Issue: `reset` clears form submission count.
    reset({
      query: searchParams.get('query') || '',
    })
  }, [pathname, searchParams, reset])

  const onSubmit = handleSubmit((data) => {
    console.log(data)

    const qs = [['query', data.query]]
      .filter((tuple) => Boolean(tuple[1]))
      .map((tuple) => {
        return `${tuple[0]}=${tuple[1]}`
      })
      .join('&')

    const href = qs.length > 0 ? `/?${qs}` : '/'
    router.push(href)
  })

  return (
    <div>
      <form onSubmit={onSubmit}>
        <label>Query</label>
        <input {...register('query')} />
        <input type="submit" value="Search" />
      </form>

      <div>
        Form State
        <pre>
          {JSON.stringify(
            {
              errors,
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

      {isFetching ? (
        <h2>Fetching:</h2>
      ) : (
        <div>
          <h2>Result:</h2>
          {data ? (
            <Sprite url={data.sprites.front_default} alt={queryString} />
          ) : (
            'Not found'
          )}
        </div>
      )}
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
