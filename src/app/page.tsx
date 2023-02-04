'use client'

// import { useRouter } from 'next/router'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'

type FormData = {
  firstName: string
  lastName: string
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

export default function Home() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>()

  const onSubmit = handleSubmit((data) => {
    console.log(data)

    const qs = [
      ['firstName', data.firstName],
      ['lastName', data.lastName],
    ]
      .filter((tuple) => Boolean(tuple[1]))
      .map((tuple) => {
        return `${tuple[0]}=${tuple[1]}`
      })
      .join('')

    if (qs.length) {
      router.push(`/?${qs}`)
    } else {
      router.push('/')
    }
    // router.push(`/?$firstName=${data.firstName}&`)
  })

  return (
    <main>
      <form onSubmit={onSubmit}>
        <label>First Name</label>
        <input {...register('firstName')} />
        <label>Last Name</label>
        <input {...register('lastName')} />
        <button
          type="button"
          onClick={() => {
            setValue('lastName', 'parker') // ✅
            // setValue('firstName', true) // ❌: true is not string
            // errors.bill // ❌: property bill does not exist
          }}
        >
          SetValue
        </button>
        <input type="submit" />
      </form>
    </main>
  )
}
